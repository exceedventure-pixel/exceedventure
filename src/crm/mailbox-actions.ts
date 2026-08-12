'use server'

import { revalidatePath } from 'next/cache'
import { crmQuery } from './data'
import { notifyClient } from './notify'
import { sendEmail } from './email'
import { fail, num, optional, relId, str, type ActionResult } from './parse'

/**
 * The shared team mailbox — the old Mailbox component, which drove Firestore
 * directly from the browser.
 *
 * Threads have three folders and a set of labels matching the addresses mail
 * arrives at. Filing is staff-only at field level, so a client cannot archive a
 * thread out of your inbox.
 */

/** `support` → `support@exceedventure.com`; a full address passes through. */
const senderFor = (mailbox: string): string => {
  const domain = process.env.RESEND_DOMAIN?.trim() || 'exceedventure.com'
  const box = mailbox.includes('@') ? mailbox : `${mailbox || 'support'}@${domain}`
  return `Exceed Venture <${box}>`
}

/**
 * Starts a thread with someone, whether or not they have a portal login.
 *
 * When the address belongs to a client account the thread is attached to that
 * company, so it lands in their dashboard as well as their email. Otherwise it
 * is a plain email thread with no client attached — which is why
 * `conversations.client` is optional.
 */
export async function composeMessage(form: FormData): Promise<ActionResult> {
  try {
    const { payload, user, as } = await crmQuery()

    const to = str(form.get('to')).toLowerCase()
    const subject = str(form.get('subject'))
    const body = str(form.get('body'))
    const mailbox = optional(str(form.get('mailbox'))) ?? 'support'

    if (!to) return { ok: false, message: 'Who is this going to?' }
    if (!subject) return { ok: false, message: 'Give it a subject.' }
    if (!body) return { ok: false, message: 'Write a message first.' }

    // Match the address to a client so the thread is scoped, rather than
    // trusting a client id from the form.
    const account = await payload.find({
      collection: 'client-accounts',
      where: { email: { equals: to } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const clientId = account.docs[0] ? relId(account.docs[0].client) : null

    const now = new Date().toISOString()
    const conversation = await payload.create({
      collection: 'conversations',
      data: {
        subject,
        ...(clientId ? { client: clientId } : {}),
        contactName: optional(str(form.get('toName'))),
        contactEmail: to,
        mailbox,
        folder: 'inbox',
        // We wrote it, so there is nothing for the team to read.
        unread: false,
        lastMessageAt: now,
        lastMessagePreview: body.slice(0, 140),
      } as never,
      ...as,
    })

    await payload.create({
      collection: 'messages',
      data: {
        conversation: conversation.id,
        ...(clientId ? { client: clientId } : {}),
        body,
        authorType: 'staff',
        authorName: user?.name || user?.email,
        direction: 'outbound',
        fromEmail: senderFor(mailbox),
        toEmail: to,
        readByStaff: true,
      } as never,
      ...as,
    })

    void sendEmail(to, {
      type: 'custom',
      subject,
      heading: subject,
      message: body,
    })

    if (clientId) {
      void notifyClient({
        payload,
        clientId,
        type: 'messageReceived',
        title: subject,
        message: body.slice(0, 140),
        link: '/portal/messages',
        meta: { conversationId: conversation.id },
      })
    }

    revalidatePath('/crm/mailbox')
    return { ok: true, id: conversation.id }
  } catch (err) {
    return fail(err)
  }
}

/** Replies in an existing thread, emailing whoever is on the other end. */
export async function replyToConversation(form: FormData): Promise<ActionResult> {
  try {
    const { payload, user, as } = await crmQuery()

    const conversationId = num(form.get('conversation'))
    const body = str(form.get('body'))
    if (!conversationId) return { ok: false, message: 'Missing conversation.' }
    if (!body) return { ok: false, message: 'Write a reply first.' }

    const conversation = await payload.findByID({
      collection: 'conversations',
      id: conversationId,
      depth: 0,
      ...as,
    })
    const clientId = relId(conversation.client)
    const preview = body.slice(0, 140)

    await payload.create({
      collection: 'messages',
      data: {
        conversation: conversationId,
        ...(clientId ? { client: clientId } : {}),
        body,
        authorType: 'staff',
        authorName: user?.name || user?.email,
        direction: 'outbound',
        fromEmail: senderFor(conversation.mailbox ?? 'support'),
        toEmail: conversation.contactEmail ?? undefined,
        readByStaff: true,
      } as never,
      ...as,
    })

    await payload.update({
      collection: 'conversations',
      id: conversationId,
      data: {
        lastMessageAt: new Date().toISOString(),
        lastMessagePreview: preview,
        unread: false,
      } as never,
      ...as,
    })

    if (conversation.contactEmail) {
      void sendEmail(conversation.contactEmail, {
        type: 'custom',
        subject: `Re: ${conversation.subject}`,
        heading: conversation.subject,
        message: body,
      })
    }

    if (clientId) {
      void notifyClient({
        payload,
        clientId,
        type: 'messageReceived',
        title: 'New message from the team',
        message: preview,
        link: '/portal/messages',
        meta: { conversationId },
      })
    }

    revalidatePath('/crm/mailbox')
    revalidatePath('/portal/messages')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function setConversationFolder(id: string, folder: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    await payload.update({ collection: 'conversations', id, data: { folder } as never, ...as })
    revalidatePath('/crm/mailbox')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function markConversationRead(id: string): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()
    await payload.update({ collection: 'conversations', id, data: { unread: false } as never, ...as })
    await payload.update({
      collection: 'messages',
      where: { and: [{ conversation: { equals: id } }, { readByStaff: { not_equals: true } }] },
      data: { readByStaff: true } as never,
      ...as,
    })
    revalidatePath('/crm/mailbox')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

/**
 * Empties the trash for good.
 *
 * Messages go before conversations: the foreign key points that way, and
 * Postgres refuses the parent delete while children remain.
 */
export async function emptyTrash(): Promise<ActionResult> {
  try {
    const { payload, as } = await crmQuery()

    const trashed = await payload.find({
      collection: 'conversations',
      where: { folder: { equals: 'trash' } },
      limit: 500,
      depth: 0,
      pagination: false,
      ...as,
    })
    if (trashed.docs.length === 0) return { ok: true }

    const conversationIds = trashed.docs.map((c) => c.id)
    await payload.delete({
      collection: 'messages',
      where: { conversation: { in: conversationIds } },
      ...as,
    })
    await payload.delete({
      collection: 'conversations',
      where: { id: { in: conversationIds } },
      ...as,
    })

    revalidatePath('/crm/mailbox')
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}
