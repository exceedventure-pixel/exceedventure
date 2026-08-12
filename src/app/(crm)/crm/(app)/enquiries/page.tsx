import React from 'react'
import Link from 'next/link'
import { Inbox, MailQuestion, Clock, CheckCheck, Trophy } from 'lucide-react'
import { crmQuery } from '@/crm/data'
import {
  PageHeader,
  StatCard,
  Table,
  Row,
  Cell,
  Badge,
  toneFor,
  humanise,
  EmptyState,
  DateText,
} from '@/crm/ui/primitives'
import { SearchBox, FilterTabs, Pager } from '@/crm/ui/Filters'
import { EnquiryStatusControl, ENQUIRY_KINDS } from '@/crm/ui/EnquiryControls'
import type { Where } from 'payload'

/**
 * Everything the public site sends in — contact forms and quick messages today,
 * pricing and quotation requests when those forms exist.
 *
 * One list rather than a screen per form: they all mean "somebody wants
 * something", and splitting them would mean four places to check and four
 * chances to miss one. The kind filter narrows when you want it narrow.
 */

const PAGE_SIZE = 25

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'New', value: 'new' },
  { label: 'In progress', value: 'inProgress' },
  { label: 'Responded', value: 'responded' },
  { label: 'Won', value: 'won' },
  { label: 'Closed', value: 'closed' },
]

/** Colour by kind so the list is scannable before you read a word of it. */
const KIND_TONE: Record<string, 'info' | 'success' | 'warning' | 'neutral'> = {
  contact: 'info',
  message: 'neutral',
  pricing: 'warning',
  quote: 'success',
  callback: 'warning',
}

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; kind?: string; page?: string }>
}) {
  const { q, status, kind, page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  const { payload, as } = await crmQuery()

  const filters: Where[] = []
  if (status) filters.push({ status: { equals: status } })
  if (kind) filters.push({ kind: { equals: kind } })
  if (q) {
    filters.push({
      or: [
        { name: { like: q } },
        { email: { like: q } },
        { company: { like: q } },
        { subject: { like: q } },
        { message: { like: q } },
      ],
    })
  }

  const [enquiries, everything] = await Promise.all([
    payload.find({
      collection: 'enquiries',
      where: filters.length ? { and: filters } : undefined,
      limit: PAGE_SIZE,
      page,
      sort: '-createdAt',
      depth: 0,
      ...as,
    }),
    // Headline figures reflect the whole pipeline, not the filtered page.
    payload.find({ collection: 'enquiries', limit: 1000, pagination: false, depth: 0, ...as }),
  ])

  const count = (predicate: (s?: string | null) => boolean) =>
    everything.docs.filter((e) => predicate(e.status)).length

  const awaiting = count((s) => s === 'new')
  const inProgress = count((s) => s === 'inProgress')
  const won = count((s) => s === 'won')

  return (
    <>
      <PageHeader
        icon={<Inbox />}
        title="Enquiries"
        description="Contact forms, messages, and — when those go live — pricing and quote requests."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Awaiting reply"
          value={awaiting}
          icon={<MailQuestion />}
          emphasis={awaiting > 0}
          hint={awaiting > 0 ? 'Nobody has answered these' : 'All picked up'}
        />
        <StatCard label="In progress" value={inProgress} icon={<Clock />} />
        <StatCard label="Won" value={won} icon={<Trophy />} />
        <StatCard label="Total" value={everything.docs.length} icon={<CheckCheck />} />
      </div>

      <div className="mb-4 mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <FilterTabs param="kind" options={ENQUIRY_KINDS} />
          <FilterTabs param="status" options={STATUS_FILTERS} />
        </div>
        <SearchBox placeholder="Search name, email or message…" />
      </div>

      {enquiries.docs.length === 0 ? (
        <EmptyState
          icon={<Inbox />}
          title={q || status || kind ? 'Nothing matches' : 'No enquiries yet'}
          description={
            q || status || kind
              ? 'Try a different search or clear the filters.'
              : 'Messages from the contact page and the site header land here.'
          }
        />
      ) : (
        <>
          <Table
            headers={['Type', 'From', 'About', 'Received', 'Status']}
          >
            {enquiries.docs.map((e) => (
              <Row key={e.id}>
                <Cell>
                  <Badge tone={KIND_TONE[e.kind ?? 'contact'] ?? 'neutral'}>
                    {humanise(e.kind)}
                  </Badge>
                </Cell>
                <Cell>
                  <Link href={`/crm/enquiries/${e.id}`} className="font-medium hover:text-primary">
                    {e.name || e.email || 'Unknown'}
                  </Link>
                  {e.email && (
                    <div className="truncate text-[11px] text-muted-foreground">{e.email}</div>
                  )}
                </Cell>
                <Cell muted className="max-w-md">
                  <span className="line-clamp-2">
                    {e.subject || e.message || '—'}
                  </span>
                </Cell>
                <Cell muted>
                  <DateText value={e.createdAt} />
                </Cell>
                <Cell>
                  <EnquiryStatusControl id={e.id} status={String(e.status ?? 'new')} />
                </Cell>
              </Row>
            ))}
          </Table>
          <Pager page={enquiries.page ?? 1} totalPages={enquiries.totalPages ?? 1} />
        </>
      )}
    </>
  )
}
