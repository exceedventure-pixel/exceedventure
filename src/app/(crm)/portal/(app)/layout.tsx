import React from 'react'
import { redirect } from 'next/navigation'
import { portalQuery } from '@/crm/data'
import { unreadCount } from '@/crm/notify'
import { Shell } from '@/crm/ui/Shell'
import { AccessPending } from '@/crm/ui/AccessPending'

/**
 * Client dashboard gate.
 *
 * Expects the `client-accounts` collection, so a staff session does not satisfy
 * it either — the two areas are genuinely separate products.
 *
 * Approval is handled here rather than by redirecting: an account that exists
 * but is not yet active gets an explanatory screen instead of being bounced to
 * login, which would look like a broken password. The data-layer guard is
 * separate and independent — access control already refuses their queries.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { payload, user } = await portalQuery()

  if (!user || user.collection !== 'client-accounts') redirect('/portal/login')

  const status = user.approvalStatus
  if (status !== 'active') return <AccessPending status={status ?? 'pending'} />

  const unread = await unreadCount(payload, 'client', user.id)

  return (
    <Shell
      brand="Exceed Venture"
      subtitle="Client dashboard"
      area="portal"
      account={{ name: user.name ?? undefined, email: user.email }}
      logoutPath="/portal/api/logout"
      loginPath="/portal/login"
      notificationsHref="/portal/notifications"
      unreadNotifications={unread}
      sections={[
        {
          items: [
            { href: '/portal', label: 'Overview', icon: 'dashboard', exact: true },
            { href: '/portal/projects', label: 'Projects', icon: 'projects' },
            { href: '/portal/invoices', label: 'Invoices', icon: 'invoices' },
            { href: '/portal/resources', label: 'Resources', icon: 'resources' },
          ],
        },
        {
          heading: 'Talk to us',
          items: [
            { href: '/portal/requests', label: 'Requests', icon: 'requests' },
            { href: '/portal/messages', label: 'Messages', icon: 'messages' },
          ],
        },
        { items: [{ href: '/portal/account', label: 'My account', icon: 'account' }] },
      ]}
    >
      {children}
    </Shell>
  )
}
