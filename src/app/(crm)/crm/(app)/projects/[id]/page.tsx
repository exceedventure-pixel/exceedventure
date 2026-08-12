import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { crmQuery, isWideStaffUser } from '@/crm/data'
import {
  PageHeader,
  Card,
  Table,
  Badge,
  toneFor,
  humanise,
  EmptyState,
  DateText,
  Money,
  StatCard,
} from '@/crm/ui/primitives'
import { TaskForm, ProjectForm, ResourceForm, AssignForm } from '@/crm/ui/forms'
import {
  ProjectStatusControl,
  DeleteProject,
  DeleteTask,
  DeleteResource,
  TaskStatusControl,
} from '@/crm/ui/decisions'
import { TaskBoard } from '@/crm/ui/TaskBoard'
import { FolderKanban } from 'lucide-react'
import { relId, relName } from '@/crm/parse'

/** One project: scope, the people on it, its task board and what it has shipped. */
export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { payload, user, as } = await crmQuery()

  const project = await payload
    .findByID({ collection: 'projects', id, depth: 1, ...as })
    .catch(() => null)
  if (!project) notFound()

  const clientId = relId(project.client)

  const [tasks, team, resources, invoices] = await Promise.all([
    payload.find({
      collection: 'tasks',
      where: { project: { equals: id } },
      limit: 200,
      sort: 'dueDate',
      depth: 1,
      ...as,
    }),
    payload.find({ collection: 'crm-accounts', limit: 100, sort: 'name', depth: 0, ...as }),
    payload.find({
      collection: 'resources',
      where: { project: { equals: id } },
      limit: 50,
      sort: 'order',
      depth: 0,
      ...as,
    }),
    payload.find({
      collection: 'invoices',
      where: { project: { equals: id } },
      limit: 50,
      sort: '-issueDate',
      depth: 0,
      ...as,
    }),
  ])

  const done = tasks.docs.filter((t) => t.status === 'done').length
  const wide = isWideStaffUser(user)

  const assigned = (project.assignedTo ?? []).map((a) => relId(a)).filter(Boolean) as (
    | string
    | number
  )[]
  const assignedNames = team.docs
    .filter((m) => assigned.some((a) => String(a) === String(m.id)))
    .map((m) => m.name || m.email)

  const teamOptions = team.docs.map((m) => ({ label: m.name || m.email, value: String(m.id) }))
  const screens = resources.docs.filter((r) => r.kind === 'screen')
  const otherResources = resources.docs.filter((r) => r.kind !== 'screen')

  return (
    <>
      <PageHeader
        icon={<FolderKanban />}
        breadcrumbs={[
          { label: 'Projects', href: '/crm/projects' },
          ...(clientId
            ? [{ label: relName(project.client) || 'Client', href: `/crm/clients/${clientId}` }]
            : []),
          { label: project.name },
        ]}
        title={project.name}
        description={project.code ? `${project.code}${project.summary ? ` · ${project.summary}` : ''}` : project.summary || undefined}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {wide && (
              <AssignForm
                kind="project"
                id={project.id}
                assigned={assigned}
                team={team.docs.map((m) => ({
                  id: m.id,
                  name: m.name || m.email,
                  role: m.role ?? undefined,
                }))}
              />
            )}
            <ProjectForm
              label="Edit"
              clients={[]}
              lockClient
              values={{
                id: project.id,
                name: project.name,
                client: clientId ?? undefined,
                status: project.status ?? undefined,
                startDate: project.startDate ?? undefined,
                dueDate: project.dueDate ?? undefined,
                value: project.value ?? undefined,
                summary: project.summary ?? undefined,
                scopeOfWork: project.scopeOfWork ?? undefined,
                internalNotes: project.internalNotes ?? undefined,
              }}
            />
            <TaskForm projectId={project.id} team={teamOptions} />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Status"
          value={<ProjectStatusControl id={project.id} status={String(project.status ?? 'notStarted')} />}
        />
        <StatCard label="Value" value={<Money minor={project.value} />} />
        <StatCard
          label="Due"
          value={
            <span className="text-base">
              <DateText value={project.dueDate} />
            </span>
          }
        />
        <StatCard
          label="Tasks done"
          value={`${done}/${tasks.totalDocs}`}
          hint={tasks.totalDocs > 0 ? `${Math.round((done / tasks.totalDocs) * 100)}% complete` : undefined}
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <section>
            <h2 className="mb-3 text-sm font-semibold">Task board</h2>
            {tasks.docs.length === 0 ? (
              <EmptyState
                title="No tasks yet"
                description="Break the project down to track progress."
              />
            ) : (
              <TaskBoard
                tasks={tasks.docs.map((t) => ({
                  id: String(t.id),
                  title: t.title,
                  status: String(t.status ?? 'todo'),
                  priority: String(t.priority ?? 'normal'),
                  dueDate: t.dueDate ?? undefined,
                  assignee: relName(t.assignee) || undefined,
                }))}
              />
            )}
          </section>

          {tasks.docs.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold">All tasks</h2>
              <Table headers={['Task', 'Assignee', 'Priority', 'Due', 'Status', '']}>
                {tasks.docs.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/40">
                    <td className="px-4 py-2.5 font-medium">{t.title}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {relName(t.assignee) || '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={t.priority === 'high' ? 'warning' : 'neutral'}>
                        {humanise(t.priority)}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      <DateText value={t.dueDate} />
                    </td>
                    <td className="px-4 py-2.5">
                      <TaskStatusControl id={t.id} status={String(t.status ?? 'todo')} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <DeleteTask id={t.id} />
                    </td>
                  </tr>
                ))}
              </Table>
            </section>
          )}

          {screens.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold">Screens</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {screens.map((s) => (
                  <Card key={s.id} className="overflow-hidden">
                    <a
                      href={s.url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-3 hover:bg-muted/40"
                    >
                      <p className="text-sm font-medium">{s.label}</p>
                      {s.caption && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{s.caption}</p>
                      )}
                    </a>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          {project.scopeOfWork && (
            <section>
              <h2 className="mb-3 text-sm font-semibold">Scope of work</h2>
              <Card className="whitespace-pre-wrap p-4 text-sm leading-relaxed">
                {project.scopeOfWork}
              </Card>
            </section>
          )}

          {project.internalNotes && (
            <section>
              <h2 className="mb-3 text-sm font-semibold">Internal notes</h2>
              <Card className="whitespace-pre-wrap border-amber-500/30 bg-amber-500/5 p-4 text-sm leading-relaxed">
                {project.internalNotes}
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Team only — this is never rendered in the client portal.
                </p>
              </Card>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold">Dates</h2>
            <Card className="divide-y divide-border text-sm">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-muted-foreground">Started</span>
                <DateText value={project.startDate} />
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-muted-foreground">Due</span>
                <DateText value={project.dueDate} />
              </div>
            </Card>
          </section>

          {assignedNames.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold">On this project</h2>
              <Card className="flex flex-wrap gap-1.5 p-3">
                {assignedNames.map((name) => (
                  <Badge key={name} tone="info">
                    {name}
                  </Badge>
                ))}
              </Card>
            </section>
          )}

          {invoices.docs.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold">Invoices</h2>
              <Card className="divide-y divide-border text-sm">
                {invoices.docs.map((i) => (
                  <div key={i.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="font-medium">{i.number}</span>
                    <span className="flex items-center gap-2">
                      <Badge tone={toneFor(i.status)}>{humanise(i.status)}</Badge>
                      <Money minor={i.total} currency={i.currency} />
                    </span>
                  </div>
                ))}
              </Card>
            </section>
          )}

          {clientId && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Files &amp; links</h2>
                <ResourceForm clientId={clientId} projectId={project.id} />
              </div>
              {otherResources.length === 0 ? (
                <EmptyState title="Nothing attached" />
              ) : (
                <Card className="divide-y divide-border text-sm">
                  {otherResources.map((r) => (
                    <div key={r.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                      <a
                        href={r.url ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 flex-1 hover:text-primary"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="truncate font-medium">{r.label}</span>
                          <Badge>{humanise(r.kind)}</Badge>
                        </span>
                      </a>
                      <DeleteResource id={r.id} clientId={clientId} />
                    </div>
                  ))}
                </Card>
              )}
            </section>
          )}

          {wide && (
            <section>
              <h2 className="mb-3 text-sm font-semibold">Danger zone</h2>
              <Card className="border-destructive/30 p-4">
                <p className="mb-3 text-xs text-muted-foreground">
                  Deleting removes the project and its tasks. Invoices raised against it stay.
                </p>
                <DeleteProject id={project.id} />
              </Card>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
