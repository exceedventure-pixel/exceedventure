import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { portalQuery } from '@/crm/data'
import {
  PageHeader,
  Card,
  Badge,
  toneFor,
  humanise,
  EmptyState,
  DateText,
  StatCard,
} from '@/crm/ui/primitives'
import { FolderKanban } from 'lucide-react'

/**
 * A client's view of one project.
 *
 * Deliberately narrower than the team's: no value, no internal notes, no task
 * breakdown. Those are guarded at field level and by the tasks collection's
 * access rule, so this page could not show them even if it tried — the omission
 * is enforced, not just a matter of what is rendered here.
 */
export default async function PortalProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { payload, as } = await portalQuery()

  const project = await payload
    .findByID({ collection: 'projects', id, depth: 0, ...as })
    .catch(() => null)
  if (!project) notFound()

  const [resources, invoices] = await Promise.all([
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
      limit: 20,
      sort: '-issueDate',
      depth: 0,
      ...as,
    }),
  ])

  const screens = resources.docs.filter((r) => r.kind === 'screen')
  const files = resources.docs.filter((r) => r.kind !== 'screen')

  return (
    <>
      <PageHeader
        icon={<FolderKanban />}
        breadcrumbs={[{ label: 'Projects', href: '/portal/projects' }, { label: project.name }]}
        title={project.name}
        description={project.summary || undefined}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          label="Status"
          value={<Badge tone={toneFor(project.status)}>{humanise(project.status)}</Badge>}
        />
        <StatCard
          label="Started"
          value={
            <span className="text-base">
              <DateText value={project.startDate} />
            </span>
          }
        />
        <StatCard
          label="Due"
          value={
            <span className="text-base">
              <DateText value={project.dueDate} />
            </span>
          }
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {project.scopeOfWork ? (
            <section>
              <h2 className="mb-3 text-sm font-semibold">What is included</h2>
              <Card className="whitespace-pre-wrap p-5 text-sm leading-relaxed">
                {project.scopeOfWork}
              </Card>
            </section>
          ) : null}

          <section>
            <h2 className="mb-3 text-sm font-semibold">Previews</h2>
            {screens.length === 0 ? (
              <EmptyState
                title="Nothing to preview yet"
                description="Designs and staging links will appear here as we share them."
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {screens.map((s) => (
                  <Card key={s.id}>
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
                      <p className="mt-2 text-[11px] font-medium text-primary">Open →</p>
                    </a>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-sm font-semibold">Files &amp; links</h2>
            {files.length === 0 ? (
              <EmptyState title="Nothing shared yet" />
            ) : (
              <Card className="divide-y divide-border text-sm">
                {files.map((r) => (
                  <a
                    key={r.id}
                    href={r.url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2.5 hover:bg-muted/40"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="truncate font-medium">{r.label}</span>
                      <Badge>{humanise(r.kind)}</Badge>
                    </span>
                    {r.notes && (
                      <span className="mt-0.5 block text-xs text-muted-foreground">{r.notes}</span>
                    )}
                  </a>
                ))}
              </Card>
            )}
          </section>

          {invoices.docs.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold">Invoices for this project</h2>
              <Card className="divide-y divide-border text-sm">
                {invoices.docs.map((i) => (
                  <div key={i.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <span className="font-medium">{i.number}</span>
                    <Badge tone={toneFor(i.status)}>{humanise(i.status)}</Badge>
                  </div>
                ))}
              </Card>
            </section>
          )}

          <Card className="p-4">
            <p className="text-sm font-medium">Something to raise?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Message the team and it goes straight to whoever is on this project.
            </p>
            <Link
              href="/portal/messages"
              className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Send a message
            </Link>
          </Card>
        </div>
      </div>
    </>
  )
}
