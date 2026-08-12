import React from 'react'
import { portalQuery } from '@/crm/data'
import { PageHeader, Card, Badge, humanise } from '@/crm/ui/primitives'
import { CircleUser } from 'lucide-react'
import { ProfileForm, PasswordForm } from '@/crm/ui/forms'
import { CancelDeletionRequest } from '@/crm/ui/decisions'
import { DeletionRequestForm } from '@/crm/ui/DeletionRequestForm'
import { relName } from '@/crm/parse'

/**
 * A client's own account.
 *
 * Closing it is a *request*, not a button that deletes things. The old app
 * deleted the auth user straight from the browser and kept a blocklist to cope
 * with the half-deleted states that produced. Here nothing is destroyed: your
 * team sees the request, and the invoices attached to the account stay put.
 */
export default async function PortalAccountPage() {
  const { payload, user, as } = await portalQuery()
  if (!user) return null

  const me = await payload.findByID({
    collection: 'client-accounts',
    id: user.id,
    depth: 1,
    ...as,
  })

  return (
    <>
      <PageHeader icon={<CircleUser />} title="My account" description="Your details and how you sign in." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold">Your details</h2>
            <ProfileForm
              side="client"
              values={{
                name: me.name ?? undefined,
                jobTitle: me.jobTitle ?? undefined,
                organization: me.organization ?? undefined,
                phone: me.phone ?? undefined,
                whatsapp: me.whatsapp ?? undefined,
                address: me.address ?? undefined,
                bio: me.bio ?? undefined,
              }}
            />
          </Card>

          <Card className="mt-6 p-5">
            <h2 className="mb-1 text-sm font-semibold">Password</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              You will need your current password — being signed in is not enough on its own.
            </p>
            <PasswordForm side="client" />
          </Card>

          <Card className="mt-6 border-destructive/30 p-5">
            <h2 className="mb-1 text-sm font-semibold">Close this account</h2>
            {me.deletionRequested ? (
              <>
                <p className="mb-4 text-xs text-muted-foreground">
                  You asked us to close this account
                  {me.deletionRequestedAt &&
                    ` on ${new Date(me.deletionRequestedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}`}
                  . We will be in touch. Nothing has been deleted yet, and you can change your mind.
                </p>
                <CancelDeletionRequest />
              </>
            ) : (
              <>
                <p className="mb-4 text-xs text-muted-foreground">
                  This sends a request to our team rather than deleting anything straight away — so
                  your invoices and project history stay intact while we sort it out with you.
                </p>
                <DeletionRequestForm />
              </>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="divide-y divide-border text-sm">
            {[
              ['Email', me.email],
              ['Company', relName(me.client) || '—'],
              ['Account', humanise(me.approvalStatus)],
              ['Sign-in', humanise(me.provider ?? 'password')],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between gap-4 px-4 py-2.5">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-right font-medium">{value as string}</span>
              </div>
            ))}
          </Card>

          <Card className="p-4">
            <p className="text-sm font-medium">Wrong company?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Signing up always creates a new company record. If you should be joined to an existing
              account, message us and we will move you across.
            </p>
          </Card>

          {me.deletionRequested && (
            <Card className="border-amber-500/30 bg-amber-500/5 p-4">
              <Badge tone="warning">Closure requested</Badge>
              <p className="mt-2 text-xs text-muted-foreground">
                Your account still works normally until we action it.
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
