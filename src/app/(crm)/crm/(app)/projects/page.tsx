import React from 'react'
import Link from 'next/link'
import { FolderKanban } from 'lucide-react'
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
  Money,
} from '@/crm/ui/primitives'
import { SearchBox, FilterTabs, Pager, ViewToggle } from '@/crm/ui/Filters'
import { CardGrid, ProjectCard } from '@/crm/ui/cards'
import { ProjectForm } from '@/crm/ui/forms'
import { ProjectStatusControl } from '@/crm/ui/decisions'
import { relId, relName } from '@/crm/parse'
import type { Where } from 'payload'

/** Every project, filterable by the stage it is sitting in. */

const PAGE_SIZE = 25

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'open' },
  { label: 'In progress', value: 'inProgress' },
  { label: 'Review', value: 'review' },
  { label: 'On hold', value: 'onHold' },
  { label: 'Completed', value: 'completed' },
]

export default async function ProjectsPage({
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
  // "Open" is the everyday view — everything not finished or abandoned.
  if (status === 'open') filters.push({ status: { not_in: ['completed', 'cancelled'] } })
  else if (status) filters.push({ status: { equals: status } })
  if (q) filters.push({ or: [{ name: { like: q } }, { code: { like: q } }] })

  const [projects, clientList] = await Promise.all([
    payload.find({
      collection: 'projects',
      where: filters.length ? { and: filters } : undefined,
      limit: PAGE_SIZE,
      page,
      sort: '-updatedAt',
      depth: 1,
      ...as,
    }),
    payload.find({ collection: 'clients', limit: 200, sort: 'name', depth: 0, ...as }),
  ])

  const clientOptions = clientList.docs.map((c) => ({ label: c.name, value: String(c.id) }))
  const wide = isWideStaffUser(user)

  // Continues across pages — a serial that restarts each page is not a serial.
  const serialOf = (index: number) => (page - 1) * PAGE_SIZE + index + 1

  return (
    <>
      <PageHeader
        icon={<FolderKanban />}
        title="Projects"
        description={wide ? `${projects.totalDocs} in total.` : 'Projects on your patch.'}
        action={<ProjectForm label="New project" clients={clientOptions} />}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs param="status" options={STATUS_FILTERS} />
        <div className="flex items-center gap-2">
          <SearchBox placeholder="Search name or code…" />
          <ViewToggle />
        </div>
      </div>

      {projects.docs.length === 0 ? (
        <EmptyState
          icon={<FolderKanban />}
          title={q || status ? 'Nothing matches' : 'No projects yet'}
          description={
            q || status
              ? 'Try a different search or clear the filter.'
              : 'Create a project against a client to get started.'
          }
        />
      ) : (
        <>
          {asCards ? (
            <CardGrid>
              {projects.docs.map((p, i) => (
                <ProjectCard
                  key={p.id}
                  href={`/crm/projects/${p.id}`}
                  serial={serialOf(i)}
                  code={p.code}
                  name={p.name}
                  clientName={relName(p.client) || undefined}
                  clientHref={relId(p.client) ? `/crm/clients/${relId(p.client)}` : null}
                  status={p.status}
                  dueDate={p.dueDate}
                  value={p.value}
                  summary={p.summary}
                />
              ))}
            </CardGrid>
          ) : (
            <Table
              headers={[
                { label: '#', align: 'right' },
                'Reference',
                'Project',
                'Client',
                'Status',
                'Due',
                { label: 'Value', align: 'right' },
              ]}
            >
              {projects.docs.map((p, i) => (
                <Row key={p.id}>
                  <Cell align="right" muted>
                    {serialOf(i)}
                  </Cell>
                  <Cell muted className="font-mono text-xs">
                    {p.code || '—'}
                  </Cell>
                  <Cell className="font-medium">
                    <Link href={`/crm/projects/${p.id}`} className="hover:text-primary">
                      {p.name}
                    </Link>
                  </Cell>
                  <Cell muted>{relName(p.client) || '—'}</Cell>
                  <Cell>
                    {wide ? (
                      <ProjectStatusControl id={p.id} status={String(p.status ?? 'notStarted')} />
                    ) : (
                      <Badge tone={toneFor(p.status)}>{humanise(p.status)}</Badge>
                    )}
                  </Cell>
                  <Cell muted>
                    <DateText value={p.dueDate} />
                  </Cell>
                  <Cell align="right">
                    <Money minor={p.value} />
                  </Cell>
                </Row>
              ))}
            </Table>
          )}
          <Pager page={projects.page ?? 1} totalPages={projects.totalPages ?? 1} />
        </>
      )}
    </>
  )
}
