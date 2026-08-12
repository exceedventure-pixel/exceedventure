import React from 'react'
import Link from 'next/link'
import { Users } from 'lucide-react'
import { crmQuery, isWideStaffUser } from '@/crm/data'
import {
  PageHeader,
  Table,
  Row,
  Cell,
  Badge,
  toneFor,
  humanise,
  EmptyState,
  DateText,
} from '@/crm/ui/primitives'
import { SearchBox, FilterTabs, Pager, ViewToggle } from '@/crm/ui/Filters'
import { CardGrid, ClientCard } from '@/crm/ui/cards'
import { ClientForm } from '@/crm/ui/forms'
import type { Where } from 'payload'

/**
 * The client list, as a table or as cards.
 *
 * Search and status filtering are applied in SQL from the URL, not in the
 * browser over a preloaded array — the old CRM fetched every client and every
 * project on mount and filtered in memory, which is fine at twenty clients and
 * not at two thousand.
 */

const PAGE_SIZE = 25

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Lead', value: 'lead' },
  { label: 'Proposal', value: 'proposal' },
  { label: 'On hold', value: 'onHold' },
  { label: 'Former', value: 'former' },
]

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string; view?: string }>
}) {
  const { q, status, page: pageParam, view } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)
  // Cards are the default; only an explicit `?view=list` switches to the table.
  const asCards = view !== 'list'
  const { payload, user, as } = await crmQuery()

  const filters: Where[] = []
  if (status) filters.push({ status: { equals: status } })
  if (q) {
    filters.push({
      or: [
        { name: { like: q } },
        { code: { like: q } },
        { email: { like: q } },
        { website: { like: q } },
      ],
    })
  }

  const clients = await payload.find({
    collection: 'clients',
    where: filters.length ? { and: filters } : undefined,
    limit: PAGE_SIZE,
    page,
    sort: 'name',
    depth: 0,
    ...as,
  })

  /**
   * The serial continues across pages rather than restarting at 1 — "row 3 of
   * page 2" is not a number anyone can use.
   */
  const serialOf = (index: number) => (page - 1) * PAGE_SIZE + index + 1

  const wide = isWideStaffUser(user)

  return (
    <>
      <PageHeader
        icon={<Users />}
        title="Clients"
        description={
          wide
            ? `${clients.totalDocs} ${clients.totalDocs === 1 ? 'company' : 'companies'}.`
            : 'The companies you have been assigned to.'
        }
        action={wide ? <ClientForm label="New client" /> : undefined}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs param="status" options={STATUS_FILTERS} />
        <div className="flex items-center gap-2">
          <SearchBox placeholder="Search name, code or email…" />
          <ViewToggle />
        </div>
      </div>

      {clients.docs.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title={q || status ? 'Nothing matches' : 'No clients yet'}
          description={
            q || status
              ? 'Try a different search or clear the filter.'
              : 'Companies appear here when someone signs up, or when you add them.'
          }
        />
      ) : (
        <>
          {asCards ? (
            <CardGrid>
              {clients.docs.map((c, i) => (
                <ClientCard
                  key={c.id}
                  id={c.id}
                  serial={serialOf(i)}
                  code={c.code}
                  name={c.name}
                  status={c.status}
                  email={c.email}
                  phone={c.phone}
                  website={c.website}
                />
              ))}
            </CardGrid>
          ) : (
            <Table
              headers={[
                { label: '#', align: 'right' },
                'Reference',
                'Company',
                'Status',
                'Contact',
                'Added',
              ]}
            >
              {clients.docs.map((c, i) => (
                <Row key={c.id}>
                  <Cell align="right" muted>
                    {serialOf(i)}
                  </Cell>
                  <Cell muted className="font-mono text-xs">
                    {c.code || '—'}
                  </Cell>
                  <Cell className="font-medium">
                    <Link href={`/crm/clients/${c.id}`} className="hover:text-primary">
                      {c.name}
                    </Link>
                  </Cell>
                  <Cell>
                    <Badge tone={toneFor(c.status)}>{humanise(c.status)}</Badge>
                  </Cell>
                  <Cell muted>{c.email || c.phone || '—'}</Cell>
                  <Cell muted>
                    <DateText value={c.createdAt} />
                  </Cell>
                </Row>
              ))}
            </Table>
          )}
          <Pager page={clients.page ?? 1} totalPages={clients.totalPages ?? 1} />
        </>
      )}
    </>
  )
}
