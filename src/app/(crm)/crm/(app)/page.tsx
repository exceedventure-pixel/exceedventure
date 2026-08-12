import React from 'react'
import Link from 'next/link'
import { crmQuery, isWideStaffUser } from '@/crm/data'
import {
  PageHeader,
  StatCard,
  Table,
  Badge,
  toneFor,
  humanise,
  Money,
  DateText,
  EmptyState,
  Card,
  Section,
} from '@/crm/ui/primitives'
import { LayoutDashboard, Users, FolderKanban, Wallet, ListChecks, Receipt } from 'lucide-react'
import { relName } from '@/crm/parse'

/** Staff dashboard — the numbers that matter plus the live worklists. */
export default async function CrmDashboard() {
  const { payload, user, as } = await crmQuery()
  const wide = isWideStaffUser(user)

  const [clients, projects, invoicesAll, pendingAccounts, openRequests, recentProjects, unpaid, myTasks] =
    await Promise.all([
      payload.count({ collection: 'clients', ...as }),
      payload.count({
        collection: 'projects',
        where: { status: { not_in: ['completed', 'cancelled'] } },
        ...as,
      }),
      // Totals need every invoice, so this is a find rather than a count.
      payload.find({ collection: 'invoices', limit: 1000, pagination: false, depth: 0, ...as }),
      payload.count({
        collection: 'client-accounts',
        where: { approvalStatus: { equals: 'pending' } },
        ...as,
      }),
      payload.count({
        collection: 'project-requests',
        where: { status: { in: ['new', 'review'] } },
        ...as,
      }),
      payload.find({ collection: 'projects', limit: 6, sort: '-updatedAt', depth: 1, ...as }),
      payload.find({
        collection: 'invoices',
        where: { status: { in: ['sent', 'overdue'] } },
        limit: 6,
        sort: 'dueDate',
        depth: 1,
        ...as,
      }),
      payload.find({
        collection: 'tasks',
        where: { and: [{ assignee: { equals: user?.id } }, { status: { not_equals: 'done' } }] },
        limit: 6,
        sort: 'dueDate',
        depth: 1,
        ...as,
      }),
    ])

  const outstanding = invoicesAll.docs
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + (i.total ?? 0), 0)

  const waiting = pendingAccounts.totalDocs + openRequests.totalDocs

  return (
    <>
      <PageHeader
        icon={<LayoutDashboard />}
        title={user?.name ? `Hello, ${user.name.split(' ')[0]}` : 'Dashboard'}
        description={wide ? 'Everything at a glance.' : 'Your patch at a glance.'}
      />

      {waiting > 0 && wide && (
        <Link href="/crm/requests" className="mb-6 block">
          <Card className="flex items-center justify-between gap-4 border-primary/30 bg-primary/5 p-4 transition-colors hover:bg-primary/10">
            <div>
              <p className="text-sm font-medium">
                {waiting} {waiting === 1 ? 'thing needs' : 'things need'} a decision
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {openRequests.totalDocs > 0 &&
                  `${openRequests.totalDocs} project ${openRequests.totalDocs === 1 ? 'request' : 'requests'}`}
                {openRequests.totalDocs > 0 && pendingAccounts.totalDocs > 0 && ' · '}
                {pendingAccounts.totalDocs > 0 &&
                  `${pendingAccounts.totalDocs} ${pendingAccounts.totalDocs === 1 ? 'signup' : 'signups'} awaiting approval`}
              </p>
            </div>
            <span className="shrink-0 text-xs font-medium text-primary">Review →</span>
          </Card>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Clients" value={clients.totalDocs} icon={<Users />} />
        <StatCard label="Active projects" value={projects.totalDocs} icon={<FolderKanban />} />
        <StatCard
          label="Outstanding"
          value={<Money minor={outstanding} />}
          icon={<Wallet />}
          emphasis={outstanding > 0}
        />
        <StatCard label="My open tasks" value={myTasks.totalDocs} icon={<ListChecks />} />
      </div>

      {myTasks.docs.length > 0 && (
        <Section
          className="mt-8"
          title="Your next tasks"
          icon={<ListChecks />}
          action={
            <Link href="/crm/my-work" className="text-xs font-medium text-primary">
              My work
            </Link>
          }
        >
          <Table headers={['Task', 'Project', 'Due']}>
            {myTasks.docs.map((t) => (
              <tr key={t.id} className="hover:bg-muted/40">
                <td className="px-4 py-2.5 font-medium">{t.title}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{relName(t.project) || '—'}</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  <DateText value={t.dueDate} />
                </td>
              </tr>
            ))}
          </Table>
        </Section>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Section
          title="Recent projects"
          icon={<FolderKanban />}
          action={
            <Link href="/crm/projects" className="text-xs font-medium text-primary">
              View all
            </Link>
          }
        >
          {recentProjects.docs.length === 0 ? (
            <EmptyState
              icon={<FolderKanban />}
              title="No projects yet"
              description="Projects will appear here once created."
            />
          ) : (
            <Table headers={['Project', 'Client', 'Status']}>
              {recentProjects.docs.map((p) => (
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
                </tr>
              ))}
            </Table>
          )}
        </Section>

        {wide && (
          <Section
            title="Outstanding invoices"
            icon={<Receipt />}
            action={
              <Link href="/crm/invoices" className="text-xs font-medium text-primary">
                View all
              </Link>
            }
          >
            {unpaid.docs.length === 0 ? (
              <EmptyState
                icon={<Receipt />}
                title="Nothing outstanding"
                description="Every invoice is settled."
              />
            ) : (
              <Table headers={['Invoice', 'Client', 'Due', 'Amount']}>
                {unpaid.docs.map((i) => (
                  <tr key={i.id} className="hover:bg-muted/40">
                    <td className="px-4 py-2.5 font-medium">{i.number}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {relName(i.client) || '—'}
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
          </Section>
        )}
      </div>
    </>
  )
}
