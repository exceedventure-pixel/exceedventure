import React from 'react'
import { crmQuery } from '@/crm/data'
import {
  PageHeader,
  Table,
  Badge,
  toneFor,
  humanise,
  EmptyState,
  DateText,
  Card,
} from '@/crm/ui/primitives'
import { UserCheck } from 'lucide-react'
import { RequestDecision, AccountDecision } from '@/crm/ui/decisions'
import { ReassignAccount } from '@/crm/ui/ReassignAccount'
import { relName } from '@/crm/parse'

/**
 * The inbox: three queues that all mean "somebody is waiting on us".
 *
 * Project requests come first because they are revenue; access requests are the
 * gate on self-registration — signups land as `pending` and see a waiting
 * screen until approved here, so registering never grants visibility on its own.
 * Deletion requests are last but must not be buried: the old CRM had no place
 * for them at all, so they arrived by email and got lost.
 */
export default async function RequestsPage() {
  const { payload, as } = await crmQuery()

  const [accounts, projectRequests, clients] = await Promise.all([
    payload.find({
      collection: 'client-accounts',
      limit: 200,
      sort: '-createdAt',
      depth: 1,
      ...as,
    }),
    payload.find({
      collection: 'project-requests',
      limit: 100,
      sort: '-createdAt',
      depth: 1,
      ...as,
    }),
    payload.find({ collection: 'clients', limit: 200, sort: 'name', depth: 0, ...as }),
  ])

  const openRequests = projectRequests.docs.filter(
    (r) => r.status === 'new' || r.status === 'review',
  )
  const closedRequests = projectRequests.docs.filter(
    (r) => r.status === 'accepted' || r.status === 'declined',
  )

  const pending = accounts.docs.filter((a) => a.approvalStatus === 'pending')
  const decided = accounts.docs.filter((a) => a.approvalStatus !== 'pending')
  const closures = accounts.docs.filter((a) => a.deletionRequested)

  const clientOptions = clients.docs.map((c) => ({ label: c.name, value: String(c.id) }))

  return (
    <>
      <PageHeader
        icon={<UserCheck />}
        title="Requests"
        description="New work clients have asked for, who may reach the dashboard, and who wants out."
      />

      <h2 className="mb-3 text-sm font-semibold">
        Project requests{openRequests.length > 0 && ` (${openRequests.length})`}
      </h2>
      {openRequests.length === 0 ? (
        <EmptyState
          title="No open requests"
          description="When a client asks for new work from their dashboard, it lands here."
        />
      ) : (
        <Table headers={['Request', 'Company', 'Raised', 'Status', 'Decision']}>
          {openRequests.map((r) => (
            <tr key={r.id} className="align-top hover:bg-muted/40">
              <td className="px-4 py-2.5">
                <div className="font-medium">{r.title}</div>
                {r.details && (
                  <div className="mt-0.5 max-w-md text-xs text-muted-foreground">{r.details}</div>
                )}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">{relName(r.client) || '—'}</td>
              <td className="px-4 py-2.5 text-muted-foreground">
                <DateText value={r.createdAt} />
              </td>
              <td className="px-4 py-2.5">
                <Badge tone={toneFor(r.status)}>{humanise(r.status)}</Badge>
              </td>
              <td className="px-4 py-2.5">
                <RequestDecision id={r.id} status={r.status ?? 'new'} />
              </td>
            </tr>
          ))}
        </Table>
      )}
      {openRequests.length > 0 && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Accepting creates the project and emails the client.
        </p>
      )}

      {closedRequests.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-sm font-semibold">Decided requests</h2>
          <Table headers={['Request', 'Company', 'Status', 'Actions']}>
            {closedRequests.map((r) => (
              <tr key={r.id} className="hover:bg-muted/40">
                <td className="px-4 py-2.5 font-medium">{r.title}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{relName(r.client) || '—'}</td>
                <td className="px-4 py-2.5">
                  <Badge tone={toneFor(r.status)}>{humanise(r.status)}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <RequestDecision id={r.id} status={r.status ?? 'new'} />
                </td>
              </tr>
            ))}
          </Table>
        </>
      )}

      <h2 className="mb-3 mt-10 text-sm font-semibold">
        Awaiting approval{pending.length > 0 && ` (${pending.length})`}
      </h2>
      {pending.length === 0 ? (
        <EmptyState title="Nothing waiting" description="New signups will queue up here." />
      ) : (
        <>
          <Table headers={['Person', 'Company', 'Requested', 'Decision']}>
            {pending.map((a) => (
              <tr key={a.id} className="align-top hover:bg-muted/40">
                <td className="px-4 py-2.5">
                  <div className="font-medium">{a.name || '—'}</div>
                  <div className="text-xs text-muted-foreground">{a.email}</div>
                </td>
                <td className="px-4 py-2.5">
                  <ReassignAccount
                    id={a.id}
                    current={relName(a.client) || '—'}
                    clients={clientOptions}
                  />
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  <DateText value={a.createdAt} />
                </td>
                <td className="px-4 py-2.5">
                  <AccountDecision id={a.id} status="pending" />
                </td>
              </tr>
            ))}
          </Table>
          <p className="mt-2 text-[11px] text-muted-foreground">
            A signup always creates its own new company. If this person belongs to a company you
            already have, move them across before approving.
          </p>
        </>
      )}

      {closures.length > 0 && (
        <>
          <h2 className="mb-3 mt-10 text-sm font-semibold">
            Account closures requested ({closures.length})
          </h2>
          <Card className="mb-3 border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
            Deleting the login leaves the company, its projects and its invoices in place — nothing
            in your books changes.
          </Card>
          <Table headers={['Person', 'Company', 'Reason', 'Asked', 'Actions']}>
            {closures.map((a) => (
              <tr key={a.id} className="align-top hover:bg-muted/40">
                <td className="px-4 py-2.5">
                  <div className="font-medium">{a.name || '—'}</div>
                  <div className="text-xs text-muted-foreground">{a.email}</div>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{relName(a.client) || '—'}</td>
                <td className="px-4 py-2.5 max-w-xs text-xs text-muted-foreground">
                  {a.deletionReason || '—'}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  <DateText value={a.deletionRequestedAt} />
                </td>
                <td className="px-4 py-2.5">
                  <AccountDecision id={a.id} status={a.approvalStatus ?? 'pending'} />
                </td>
              </tr>
            ))}
          </Table>
        </>
      )}

      {decided.length > 0 && (
        <>
          <h2 className="mb-3 mt-10 text-sm font-semibold">All dashboard accounts</h2>
          <Table headers={['Person', 'Company', 'Status', 'Actions']}>
            {decided.map((a) => (
              <tr key={a.id} className="hover:bg-muted/40">
                <td className="px-4 py-2.5">
                  <div className="font-medium">{a.name || '—'}</div>
                  <div className="text-xs text-muted-foreground">{a.email}</div>
                </td>
                <td className="px-4 py-2.5">
                  <ReassignAccount
                    id={a.id}
                    current={relName(a.client) || '—'}
                    clients={clientOptions}
                  />
                </td>
                <td className="px-4 py-2.5">
                  <Badge tone={toneFor(a.approvalStatus)}>{humanise(a.approvalStatus)}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  <AccountDecision id={a.id} status={a.approvalStatus ?? 'pending'} />
                </td>
              </tr>
            ))}
          </Table>
        </>
      )}
    </>
  )
}
