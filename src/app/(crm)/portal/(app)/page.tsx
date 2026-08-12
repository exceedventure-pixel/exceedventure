import React from 'react'
import Link from 'next/link'
import { portalQuery } from '@/crm/data'
import {
  PageHeader,
  StatCard,
  Table,
  Badge,
  toneFor,
  humanise,
  EmptyState,
  DateText,
  Money,
  Card,
} from '@/crm/ui/primitives'
import { LayoutDashboard } from 'lucide-react'
import { RequestProjectForm } from '@/crm/ui/forms'

/**
 * Client overview.
 *
 * Every query runs without overrideAccess, so the scoping constraint is applied
 * in SQL — this page cannot show another company's data even by mistake.
 */
export default async function PortalOverview() {
  const { payload, user, as } = await portalQuery()

  const [projects, invoices, requests, messages] = await Promise.all([
    payload.find({ collection: 'projects', limit: 5, sort: '-updatedAt', depth: 0, ...as }),
    payload.find({ collection: 'invoices', limit: 100, sort: '-issueDate', depth: 0, ...as }),
    payload.find({
      collection: 'project-requests',
      where: { status: { in: ['new', 'review'] } },
      limit: 5,
      sort: '-createdAt',
      depth: 0,
      ...as,
    }),
    payload.find({
      collection: 'messages',
      where: { authorType: { equals: 'staff' } },
      limit: 1,
      sort: '-createdAt',
      depth: 0,
      ...as,
    }),
  ])

  const outstanding = invoices.docs
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + (i.total ?? 0), 0)
  const overdue = invoices.docs.filter((i) => i.status === 'overdue').length
  const active = projects.docs.filter(
    (p) => p.status !== 'completed' && p.status !== 'cancelled',
  ).length

  const latest = messages.docs[0]
  const firstName = user?.name?.split(' ')[0]

  return (
    <>
      <PageHeader
        icon={<LayoutDashboard />}
        title={firstName ? `Hello, ${firstName}` : 'Overview'}
        description="Your projects and invoices with us."
        action={<RequestProjectForm />}
      />

      {overdue > 0 && (
        <Link href="/portal/invoices" className="mb-6 block">
          <Card className="flex items-center justify-between gap-4 border-amber-500/30 bg-amber-500/5 p-4 transition-colors hover:bg-amber-500/10">
            <div>
              <p className="text-sm font-medium">
                {overdue} {overdue === 1 ? 'invoice is' : 'invoices are'} overdue
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Get in touch if there is a problem with any of them.
              </p>
            </div>
            <span className="shrink-0 text-xs font-medium text-amber-600">View →</span>
          </Card>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active projects" value={active} />
        <StatCard label="Outstanding" value={<Money minor={outstanding} />} />
        <StatCard label="Open requests" value={requests.totalDocs} />
        <StatCard label="Invoices" value={invoices.docs.length} />
      </div>

      {latest && (
        <Card className="mt-6 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Latest from the team
              </p>
              <p className="mt-2 line-clamp-2 text-sm">{latest.body}</p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {latest.authorName || 'Exceed Venture'} · <DateText value={latest.createdAt} />
              </p>
            </div>
            <Link
              href="/portal/messages"
              className="shrink-0 text-xs font-medium text-primary hover:underline"
            >
              Reply →
            </Link>
          </div>
        </Card>
      )}

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Projects</h2>
          <Link href="/portal/projects" className="text-xs font-medium text-primary">
            View all
          </Link>
        </div>
        {projects.docs.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Once work starts, it will show up here."
          />
        ) : (
          <Table headers={['Project', 'Status', 'Due']}>
            {projects.docs.map((p) => (
              <tr key={p.id} className="hover:bg-muted/40">
                <td className="px-4 py-2.5">
                  <Link href={`/portal/projects/${p.id}`} className="font-medium hover:text-primary">
                    {p.name}
                  </Link>
                </td>
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

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Invoices</h2>
          <Link href="/portal/invoices" className="text-xs font-medium text-primary">
            View all
          </Link>
        </div>
        {invoices.docs.length === 0 ? (
          <EmptyState title="No invoices yet" description="Invoices will appear here when issued." />
        ) : (
          <Table headers={['Number', 'Status', 'Due', 'Total']}>
            {invoices.docs.slice(0, 5).map((i) => (
              <tr key={i.id} className="hover:bg-muted/40">
                <td className="px-4 py-2.5 font-medium">{i.number}</td>
                <td className="px-4 py-2.5">
                  <Badge tone={toneFor(i.status)}>{humanise(i.status)}</Badge>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  <DateText value={i.dueDate} />
                </td>
                <td className="px-4 py-2.5 text-right font-medium">
                  <Money minor={i.total} currency={i.currency} />
                </td>
              </tr>
            ))}
          </Table>
        )}
      </section>
    </>
  )
}
