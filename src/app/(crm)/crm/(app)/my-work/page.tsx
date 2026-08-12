import React from 'react'
import Link from 'next/link'
import { crmQuery } from '@/crm/data'
import {
  PageHeader,
  StatCard,
  Table,
  Badge,
  toneFor,
  humanise,
  EmptyState,
  DateText,
} from '@/crm/ui/primitives'
import { TaskStatusControl } from '@/crm/ui/decisions'
import { BriefcaseBusiness } from 'lucide-react'
import { relName } from '@/crm/parse'

/**
 * One person's own workload — the old Work Portal, which was a separate page at
 * a separate URL with its own copy of the project list and task board.
 *
 * It is a view here, not a separate area: the same collections, filtered to
 * "assigned to me". A manager gets the same page and finds their own assignments
 * on it, which the old split made impossible — a manager had to choose between
 * the admin portal and the work portal.
 */
export default async function MyWorkPage() {
  const { payload, user, as } = await crmQuery()
  if (!user) return null

  const [projects, clients, tasks] = await Promise.all([
    payload.find({
      collection: 'projects',
      where: { assignedTo: { contains: user.id } },
      limit: 100,
      sort: 'dueDate',
      depth: 1,
      ...as,
    }),
    payload.find({
      collection: 'clients',
      where: { assignedTo: { contains: user.id } },
      limit: 100,
      sort: 'name',
      depth: 0,
      ...as,
    }),
    payload.find({
      collection: 'tasks',
      where: { and: [{ assignee: { equals: user.id } }, { status: { not_equals: 'done' } }] },
      limit: 100,
      sort: 'dueDate',
      depth: 1,
      ...as,
    }),
  ])

  const active = projects.docs.filter(
    (p) => p.status !== 'completed' && p.status !== 'cancelled',
  ).length

  // "Overdue" means a date in the past on something not finished — a due date on
  // a completed project is history, not a problem.
  const today = new Date().setHours(0, 0, 0, 0)
  const overdue = tasks.docs.filter(
    (t) => t.dueDate && new Date(t.dueDate).getTime() < today,
  ).length

  return (
    <>
      <PageHeader
        icon={<BriefcaseBusiness />}
        title="My work"
        description="The clients, projects and tasks that are yours."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active projects" value={active} />
        <StatCard label="Clients" value={clients.totalDocs} />
        <StatCard label="Open tasks" value={tasks.totalDocs} />
        <StatCard
          label="Overdue"
          value={overdue}
          hint={overdue > 0 ? 'Past their due date' : 'Nothing late'}
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold">My tasks</h2>
        {tasks.docs.length === 0 ? (
          <EmptyState
            title="No open tasks"
            description="Tasks assigned to you will show up here."
          />
        ) : (
          <Table headers={['Task', 'Project', 'Priority', 'Due', 'Status']}>
            {tasks.docs.map((t) => {
              const late = t.dueDate && new Date(t.dueDate).getTime() < today
              return (
                <tr key={t.id} className="hover:bg-muted/40">
                  <td className="px-4 py-2.5 font-medium">{t.title}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {relName(t.project) || '—'}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={t.priority === 'high' ? 'warning' : 'neutral'}>
                      {humanise(t.priority)}
                    </Badge>
                  </td>
                  <td className={`px-4 py-2.5 ${late ? 'text-destructive' : 'text-muted-foreground'}`}>
                    <DateText value={t.dueDate} />
                  </td>
                  <td className="px-4 py-2.5">
                    <TaskStatusControl id={t.id} status={String(t.status ?? 'todo')} />
                  </td>
                </tr>
              )
            })}
          </Table>
        )}
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold">My projects</h2>
          {projects.docs.length === 0 ? (
            <EmptyState title="Nothing assigned" description="Ask a manager to put you on a project." />
          ) : (
            <Table headers={['Project', 'Client', 'Status', 'Due']}>
              {projects.docs.map((p) => (
                <tr key={p.id} className="hover:bg-muted/40">
                  <td className="px-4 py-2.5 font-medium">
                    <Link href={`/crm/projects/${p.id}`} className="hover:text-primary">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{relName(p.client) || '—'}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone={toneFor(p.status)}>{humanise(p.status)}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    <DateText value={p.dueDate} />
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold">My clients</h2>
          {clients.docs.length === 0 ? (
            <EmptyState title="No clients assigned" />
          ) : (
            <Table headers={['Client', 'Status']}>
              {clients.docs.map((c) => (
                <tr key={c.id} className="hover:bg-muted/40">
                  <td className="px-4 py-2.5 font-medium">
                    <Link href={`/crm/clients/${c.id}`} className="hover:text-primary">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={toneFor(c.status)}>{humanise(c.status)}</Badge>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </section>
      </div>
    </>
  )
}
