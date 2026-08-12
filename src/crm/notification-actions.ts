'use server'

import { revalidatePath } from 'next/cache'
import type { Where } from 'payload'
import { crmQuery, isStaffUser } from './data'
import type { SessionCollection } from './session'
import { fail, type ActionResult } from './parse'

/**
 * What a recipient can do with their own notifications.
 *
 * `read` is the only field either side may write, and the collection's access
 * rule narrows every one of these to rows addressed to the caller — so "mark
 * all read" cannot reach anybody else's bell even though it takes no id.
 */

/** Annotated as `Where` so the two branches do not widen into an unusable union. */
const scope = (user: { id: string | number } | null, staff: boolean): Where =>
  staff ? { staffRecipient: { equals: user?.id } } : { clientRecipient: { equals: user?.id } }

export async function markNotificationRead(id: string, area: SessionCollection = 'crm-accounts'): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery(area)
    await payload.update({ collection: 'notifications', id, data: { read: true } as never, ...as })
    revalidatePath('/crm')
    revalidatePath('/portal')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function markAllNotificationsRead(area: SessionCollection = 'crm-accounts'): Promise<ActionResult> {
  try {
    const { payload, user, as } = await crmQuery(area)
    if (!user) return { ok: false, message: 'Not signed in.' }

    await payload.update({
      collection: 'notifications',
      where: {
        and: [scope(user, isStaffUser(user)), { read: { not_equals: true } }],
      },
      data: { read: true } as never,
      ...as,
    })

    revalidatePath('/crm')
    revalidatePath('/crm/notifications')
    revalidatePath('/portal')
    revalidatePath('/portal/notifications')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function clearNotifications(area: SessionCollection = 'crm-accounts'): Promise<ActionResult> {
  try {
    const { payload, user, as } = await crmQuery(area)
    if (!user) return { ok: false, message: 'Not signed in.' }

    await payload.delete({
      collection: 'notifications',
      where: scope(user, isStaffUser(user)),
      ...as,
    })

    revalidatePath('/crm/notifications')
    revalidatePath('/portal/notifications')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

/**
 * Feeds the bell.
 *
 * A polling read rather than a subscription: the old app held a Firestore
 * listener open per browser tab, which is the kind of thing that quietly costs
 * money. Thirty-second polling on a page that is already server-rendered is
 * enough for a notification bell.
 */
export async function fetchNotifications(area: SessionCollection = 'crm-accounts'): Promise<{
  unread: number
  items: {
    id: string
    title: string
    message?: string
    link?: string
    read: boolean
    createdAt: string
  }[]
}> {
  try {
    const { payload, user, as } = await crmQuery(area)
    if (!user) return { unread: 0, items: [] }

    const where = scope(user, isStaffUser(user))

    const [recent, unread] = await Promise.all([
      payload.find({
        collection: 'notifications',
        where,
        limit: 12,
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

    return {
      unread: unread.totalDocs,
      items: recent.docs.map((n) => ({
        id: String(n.id),
        title: n.title,
        message: n.message ?? undefined,
        link: n.link ?? undefined,
        read: Boolean(n.read),
        createdAt: n.createdAt,
      })),
    }
  } catch {
    // The bell must never take a page down with it.
    return { unread: 0, items: [] }
  }
}
