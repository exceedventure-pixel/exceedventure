import React from 'react'
import { crmQuery } from '@/crm/data'
import { PageHeader, Card, Badge, humanise } from '@/crm/ui/primitives'
import { CircleUser } from 'lucide-react'
import { ProfileForm, PasswordForm } from '@/crm/ui/forms'

/**
 * A teammate's own profile.
 *
 * Role and pause are absent by design: they are admin-only fields, so a form
 * offering them here would fail server-side. Showing the role read-only makes
 * that boundary visible rather than mysterious.
 */
export default async function CrmAccountPage() {
  const { payload, user, as } = await crmQuery()
  if (!user) return null

  const me = await payload.findByID({
    collection: 'crm-accounts',
    id: user.id,
    depth: 0,
    ...as,
  })

  const [assignedClients, assignedProjects] = await Promise.all([
    payload.count({ collection: 'clients', where: { assignedTo: { contains: user.id } }, ...as }),
    payload.count({ collection: 'projects', where: { assignedTo: { contains: user.id } }, ...as }),
  ])

  return (
    <>
      <PageHeader icon={<CircleUser />} title="My account" description="Your profile and sign-in details." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold">Profile</h2>
            <ProfileForm
              side="staff"
              values={{
                name: me.name ?? undefined,
                jobTitle: me.jobTitle ?? undefined,
                phone: me.phone ?? undefined,
              }}
            />
          </Card>

          <Card className="mt-6 p-5">
            <h2 className="mb-1 text-sm font-semibold">Password</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Your current password is required — a signed-in session on its own is not enough to
              change it.
            </p>
            <PasswordForm side="staff" />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="divide-y divide-border text-sm">
            {[
              ['Email', me.email],
              ['Role', humanise(me.role)],
              ['Sign-in', humanise(me.provider ?? 'password')],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between gap-4 px-4 py-2.5">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-right font-medium">{value as string}</span>
              </div>
            ))}
          </Card>

          <Card className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Your patch
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Clients assigned</span>
                <span className="font-medium tabular-nums">{assignedClients.totalDocs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Projects assigned</span>
                <span className="font-medium tabular-nums">{assignedProjects.totalDocs}</span>
              </div>
            </div>
            {me.role !== 'member' && (
              <p className="mt-3 text-[11px] text-muted-foreground">
                As {me.role === 'admin' ? 'an admin' : 'a manager'} you can see everything, whether
                or not it is assigned to you.
              </p>
            )}
          </Card>

          {me.isPaused && (
            <Card className="border-amber-500/30 bg-amber-500/5 p-4">
              <Badge tone="warning">Paused</Badge>
              <p className="mt-2 text-xs text-muted-foreground">
                This account is currently suspended.
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
