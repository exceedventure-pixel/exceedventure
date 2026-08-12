import React from 'react'
import { crmQuery } from '@/crm/data'
import { PageHeader } from '@/crm/ui/primitives'
import { Bell } from 'lucide-react'
import { NotificationList } from '@/crm/ui/NotificationList'

/** Everything the bell has shown you, kept. */
export default async function CrmNotificationsPage() {
  const { payload, user, as } = await crmQuery()

  const where = { staffRecipient: { equals: user?.id } }

  const [notifications, unread] = await Promise.all([
    payload.find({
      collection: 'notifications',
      where,
      limit: 100,
      sort: '-createdAt',
      depth: 0,
      ...as,
    }),
    payload.count({
      collection: 'notifications',
      where: { and: [where, { read: { not_equals: true } }] },
      ...as,
    }),
  ])

  return (
    <>
      <PageHeader
        icon={<Bell />}
        title="Notifications"
        description={
          unread.totalDocs > 0 ? `${unread.totalDocs} unread.` : 'You are all caught up.'
        }
      />
      <NotificationList
        area="crm-accounts"
        unread={unread.totalDocs}
        items={notifications.docs.map((n) => ({
          id: String(n.id),
          title: n.title,
          message: n.message ?? undefined,
          link: n.link ?? undefined,
          read: Boolean(n.read),
          createdAt: n.createdAt,
        }))}
      />
    </>
  )
}
