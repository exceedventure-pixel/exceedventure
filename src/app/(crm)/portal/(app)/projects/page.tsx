import React from 'react'
import Link from 'next/link'
import { portalQuery } from '@/crm/data'
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
import { FilterTabs, ViewToggle } from '@/crm/ui/Filters'
import { CardGrid, ProjectCard } from '@/crm/ui/cards'
import { FolderKanban } from 'lucide-react'
import { RequestProjectForm } from '@/crm/ui/forms'
import type { Where } from 'payload'

/** The client's own projects. Access control scopes the query in SQL. */
export default async function PortalProjects({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; view?: string }>
}) {
  const { status, view } = await searchParams
  // Cards are the default; only an explicit `?view=list` switches to the table.
  const asCards = view !== 'list'
  const { payload, as } = await portalQuery()

  const filters: Where[] = []
  if (status === 'open') filters.push({ status: { not_in: ['completed', 'cancelled'] } })
  else if (status) filters.push({ status: { equals: status } })

  const projects = await payload.find({
    collection: 'projects',
    where: filters.length ? { and: filters } : undefined,
    limit: 100,
    sort: '-updatedAt',
    depth: 0,
    ...as,
  })

  return (
    <>
      <PageHeader
        icon={<FolderKanban />}
        title="Projects"
        description="Everything we are working on for you."
        action={<RequestProjectForm />}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          param="status"
          options={[
            { label: 'All', value: '' },
            { label: 'In flight', value: 'open' },
            { label: 'Completed', value: 'completed' },
          ]}
        />
        <ViewToggle />
      </div>

      {projects.docs.length === 0 ? (
        <EmptyState
          title={status ? 'Nothing here' : 'No projects yet'}
          description={
            status ? 'Try another filter.' : 'Once work starts, it will show up here.'
          }
        />
      ) : asCards ? (
        <CardGrid>
          {projects.docs.map((p, i) => (
            <ProjectCard
              key={p.id}
              href={`/portal/projects/${p.id}`}
              serial={i + 1}
              code={p.code}
              name={p.name}
              status={p.status}
              dueDate={p.dueDate}
              summary={p.summary}
              // A client never sees what the work is booked at.
              showValue={false}
            />
          ))}
        </CardGrid>
      ) : (
        <Table headers={[{ label: '#', align: 'right' }, 'Reference', 'Project', 'Status', 'Started', 'Due']}>
          {projects.docs.map((p, i) => (
            <Row key={p.id}>
              <Cell align="right" muted>
                {i + 1}
              </Cell>
              <Cell muted className="font-mono text-xs">
                {p.code || '—'}
              </Cell>
              <Cell>
                <Link href={`/portal/projects/${p.id}`} className="font-medium hover:text-primary">
                  {p.name}
                </Link>
                {p.summary && (
                  <div className="mt-0.5 text-xs text-muted-foreground">{p.summary}</div>
                )}
              </Cell>
              <Cell>
                <Badge tone={toneFor(p.status)}>{humanise(p.status)}</Badge>
              </Cell>
              <Cell muted>
                <DateText value={p.startDate} />
              </Cell>
              <Cell muted>
                <DateText value={p.dueDate} />
              </Cell>
            </Row>
          ))}
        </Table>
      )}
    </>
  )
}
