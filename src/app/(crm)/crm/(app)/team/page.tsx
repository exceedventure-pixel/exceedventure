import React from 'react'
import { crmQuery } from '@/crm/data'
import {
  PageHeader,
  Table,
  Badge,
  humanise,
  EmptyState,
  DateText,
  StatCard,
} from '@/crm/ui/primitives'
import { InviteForm } from '@/crm/ui/forms'
import { UsersRound } from 'lucide-react'
import { TeamControls } from '@/crm/ui/decisions'
import { emailConfigured } from '@/crm/email'

/** Team accounts. Creating one requires the admin role — enforced server-side. */
export default async function TeamPage() {
  const { payload, user, as } = await crmQuery()
  const team = await payload.find({
    collection: 'crm-accounts',
    limit: 100,
    sort: 'name',
    depth: 0,
    ...as,
  })

  const byRole = (role: string) => team.docs.filter((m) => m.role === role).length
  const paused = team.docs.filter((m) => m.isPaused).length

  return (
    <>
      <PageHeader
        icon={<UsersRound />}
        title="Team"
        description="Only admins can add, promote or remove people."
        action={<InviteForm />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Admins" value={byRole('admin')} />
        <StatCard label="Managers" value={byRole('manager')} />
        <StatCard label="Members" value={byRole('member')} />
        <StatCard label="Paused" value={paused} hint={paused > 0 ? 'No access' : 'All active'} />
      </div>

      <div className="mb-4 mt-8">
        {!emailConfigured() && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-muted-foreground">
            Email is not configured, so an invite will not send its credentials. Set{' '}
            <code className="font-mono">RESEND_API_KEY</code> to switch it on — until then, pass the
            temporary password on yourself.
          </p>
        )}
      </div>

      {team.docs.length === 0 ? (
        <EmptyState title="No teammates yet" />
      ) : (
        <Table headers={['Name', 'Email', 'Role', 'Added', 'Actions']}>
          {team.docs.map((m) => (
            <tr key={m.id} className="hover:bg-muted/40">
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{m.name || '—'}</span>
                  {m.isPaused && <Badge tone="warning">Paused</Badge>}
                </div>
                {m.jobTitle && (
                  <div className="text-[11px] text-muted-foreground">{m.jobTitle}</div>
                )}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">{m.email}</td>
              <td className="px-4 py-2.5">
                <Badge tone={m.role === 'admin' ? 'info' : 'neutral'}>{humanise(m.role)}</Badge>
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                <DateText value={m.createdAt} />
              </td>
              <td className="px-4 py-2.5">
                <TeamControls
                  id={m.id}
                  role={String(m.role ?? 'member')}
                  paused={Boolean(m.isPaused)}
                  isSelf={String(m.id) === String(user?.id)}
                />
              </td>
            </tr>
          ))}
        </Table>
      )}

      <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
        <p className="mb-1 font-semibold text-foreground">What each role can do</p>
        <p>
          <strong>Admin</strong> — everything, including team accounts and billing.
          <br />
          <strong>Manager</strong> — every client, project and invoice, but not team accounts.
          <br />
          <strong>Member</strong> — only the clients and projects they are assigned to. Pausing an
          account blocks it at the data layer, not just in the interface.
        </p>
      </div>
    </>
  )
}
