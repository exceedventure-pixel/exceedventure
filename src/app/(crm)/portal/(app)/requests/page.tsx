import React from 'react'
import { portalQuery } from '@/crm/data'
import {
  PageHeader,
  Table,
  Badge,
  toneFor,
  humanise,
  EmptyState,
  DateText,
} from '@/crm/ui/primitives'
import { RequestProjectForm } from '@/crm/ui/forms'
import { UserCheck } from 'lucide-react'
import { WithdrawRequest } from '@/crm/ui/decisions'

/** Clients raise new work here — the old portal's "Request New Project". */
export default async function PortalRequests() {
  const { payload, as } = await portalQuery()
  const requests = await payload.find({
    collection: 'project-requests',
    limit: 50,
    sort: '-createdAt',
    depth: 0,
    ...as,
  })

  const open = requests.docs.filter((r) => r.status === 'new' || r.status === 'review')

  return (
    <>
      <PageHeader
        icon={<UserCheck />}
        title="Requests"
        description="Tell us about work you'd like us to take on."
        action={<RequestProjectForm />}
      />

      {requests.docs.length === 0 ? (
        <EmptyState
          title="No requests yet"
          description="Send us a request and we'll come back to you, usually within a day."
        />
      ) : (
        <>
          <Table headers={['Request', 'Status', 'Sent', '']}>
            {requests.docs.map((r) => {
              const stillOpen = r.status === 'new' || r.status === 'review'
              return (
                <tr key={r.id} className="align-top hover:bg-muted/40">
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{r.title}</div>
                    {r.details && (
                      <div className="mt-0.5 max-w-lg text-xs text-muted-foreground">
                        {r.details}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={toneFor(r.status)}>{humanise(r.status)}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    <DateText value={r.createdAt} />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {stillOpen && <WithdrawRequest id={r.id} />}
                  </td>
                </tr>
              )
            })}
          </Table>
          {open.length > 0 && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              You can withdraw a request while it is still open. Once we have decided, it stays on
              record.
            </p>
          )}
        </>
      )}
    </>
  )
}
