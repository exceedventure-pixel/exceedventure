import React from 'react'
import { redirect } from 'next/navigation'
import { crmQuery, isWideStaffUser } from '@/crm/data'
import { unreadCount } from '@/crm/notify'
import { Shell, type NavSection } from '@/crm/ui/Shell'
import { StaffPaused } from '@/crm/ui/StaffPaused'

/**
 * Staff area gate.
 *
 * The check lives in the layout because every nested route renders through it —
 * middleware can be bypassed by a route that forgets to opt in, a layout cannot.
 * The account's *collection* is verified, not merely that someone is signed in,
 * so a valid client-portal session does not pass.
 *
 * This sits in an `(app)` route group so /crm/login is a sibling rather than a
 * child. Nesting the login page under this guard made it redirect to itself.
 *
 * The navigation differs by role. A member gets "My work" and no team or billing
 * links — not as a security measure (access control already refuses those reads)
 * but because a sidebar full of pages that return nothing is a bad sidebar.
 */
export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const { payload, user } = await crmQuery()

  if (!user || user.collection !== 'crm-accounts') redirect('/crm/login')
  // A suspended teammate keeps a valid cookie until it expires. Access control
  // already refuses their queries; this explains why rather than showing them
  // a dashboard of zeroes.
  if (user.isPaused) return <StaffPaused />

  const wide = isWideStaffUser(user)

  // Counts for the sidebar badges. Each is guarded so a slow or failing count
  // never takes down the whole shell.
  const safeCount = async (fn: () => Promise<{ totalDocs: number }>) =>
    fn()
      .then((r) => r.totalDocs)
      .catch(() => 0)

  const [unread, pendingAccounts, openRequests, unreadMail, newEnquiries] = await Promise.all([
    unreadCount(payload, 'staff', user.id),
    wide
      ? safeCount(() =>
          payload.count({
            collection: 'client-accounts',
            where: { approvalStatus: { equals: 'pending' } },
            overrideAccess: true,
          }),
        )
      : Promise.resolve(0),
    wide
      ? safeCount(() =>
          payload.count({
            collection: 'project-requests',
            where: { status: { in: ['new', 'review'] } },
            overrideAccess: true,
          }),
        )
      : Promise.resolve(0),
    wide
      ? safeCount(() =>
          payload.count({
            collection: 'conversations',
            where: { and: [{ unread: { equals: true } }, { folder: { equals: 'inbox' } }] },
            overrideAccess: true,
          }),
        )
      : Promise.resolve(0),
    wide
      ? safeCount(() =>
          payload.count({
            collection: 'enquiries',
            where: { status: { equals: 'new' } },
            overrideAccess: true,
          }),
        )
      : Promise.resolve(0),
  ])

  const sections: NavSection[] = [
    {
      items: [
        { href: '/crm', label: 'Dashboard', icon: 'dashboard', exact: true },
        { href: '/crm/my-work', label: 'My work', icon: 'work' },
        ...(wide
          ? [
              {
                href: '/crm/requests',
                label: 'Requests',
                icon: 'requests' as const,
                badge: pendingAccounts + openRequests,
              },
              {
                href: '/crm/mailbox',
                label: 'Mailbox',
                icon: 'mailbox' as const,
                badge: unreadMail,
              },
              {
                href: '/crm/enquiries',
                label: 'Enquiries',
                icon: 'inbox' as const,
                badge: newEnquiries,
              },
            ]
          : []),
      ],
    },
    {
      heading: 'Manage',
      items: [
        { href: '/crm/clients', label: 'Clients', icon: 'clients' },
        { href: '/crm/projects', label: 'Projects', icon: 'projects' },
        ...(wide
          ? [
              { href: '/crm/invoices', label: 'Invoices', icon: 'invoices' as const },
              { href: '/crm/payments', label: 'Payments', icon: 'payments' as const },
              { href: '/crm/team', label: 'Team', icon: 'team' as const },
            ]
          : []),
      ],
    },
    { items: [{ href: '/crm/account', label: 'My account', icon: 'account' }] },
  ]

  return (
    <Shell
      brand="Exceed Venture"
      subtitle="Team CRM"
      area="crm"
      account={{ name: user.name ?? undefined, email: user.email, role: user.role }}
      logoutPath="/crm/api/logout"
      loginPath="/crm/login"
      notificationsHref="/crm/notifications"
      unreadNotifications={unread}
      sections={sections}
    >
      {children}
    </Shell>
  )
}
