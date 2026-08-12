import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notifyStaff } from '@/crm/notify'

/**
 * Inbound mail → the shared mailbox.
 *
 * Point your provider's inbound webhook (Resend, Postmark, SendGrid — the shapes
 * differ, so the parsing below is deliberately forgiving) at this route. Without
 * it the mailbox can only send: replies to support@ would land in a real inbox
 * somewhere and never appear in the CRM, which is how the old version's mailbox
 * ended up half-used.
 *
 * SECURITY. This endpoint is unauthenticated by nature — a mail provider has no
 * session. Two things stand in for that:
 *
 *   1. A shared secret, required. Set `INBOUND_EMAIL_SECRET` and pass it as
 *      `?token=` or an `X-Webhook-Secret` header. With no secret configured the
 *      route refuses every request rather than defaulting to open, because an
 *      open version lets anyone forge a message from any client.
 *   2. Nothing here trusts the sender's claimed identity for anything that
 *      grants access. A matched client only decides which thread the message
 *      joins; `authorType` is always 'client' and never 'staff', so forged mail
 *      cannot impersonate your team inside the CRM.
 */

const asString = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const v = value as { email?: string; address?: string; text?: string }
    return v.email ?? v.address ?? v.text ?? ''
  }
  return ''
}

/** Providers send `to` as a string, an array, or an array of objects. */
const firstAddress = (value: unknown): string => {
  if (Array.isArray(value)) return asString(value[0])
  return asString(value)
}

/** "Name <a@b.com>" → "a@b.com" */
const bareEmail = (value: string): string => {
  const match = value.match(/<([^>]+)>/)
  return (match ? match[1]! : value).trim().toLowerCase()
}

/** "Name <a@b.com>" → "Name" */
const displayName = (value: string): string => {
  const match = value.match(/^\s*"?([^"<]+?)"?\s*</)
  return match ? match[1]!.trim() : ''
}

/** Which of our addresses it was sent to decides the label on the thread. */
const mailboxFor = (to: string): string => {
  const local = to.split('@')[0]?.toLowerCase() ?? ''
  const known = ['support', 'sales', 'info', 'billing', 'contact']
  return known.includes(local) ? local : 'other'
}

const authorised = (req: Request): boolean => {
  const secret = process.env.INBOUND_EMAIL_SECRET?.trim()
  // No secret configured → closed, not open.
  if (!secret) return false

  const header = req.headers.get('x-webhook-secret')?.trim()
  const query = new URL(req.url).searchParams.get('token')?.trim()
  return header === secret || query === secret
}

export async function POST(req: Request) {
  if (!authorised(req)) {
    return Response.json({ message: 'Not authorised.' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return Response.json({ message: 'Invalid JSON.' }, { status: 400 })
  }

  // Resend nests under `data`; most others post the fields at the top level.
  const mail = ((body.data as Record<string, unknown>) ?? body) as Record<string, unknown>

  const fromRaw = asString(mail.from)
  const fromEmail = bareEmail(fromRaw)
  const toEmail = bareEmail(firstAddress(mail.to))
  const subject = asString(mail.subject) || '(no subject)'
  const text = asString(mail.text) || asString(mail.plain) || ''
  const html = asString(mail.html)
  // Prefer plain text; fall back to stripping tags rather than storing markup
  // that would render as raw HTML in the thread.
  const bodyText = (text || html.replace(/<[^>]+>/g, ' ')).replace(/\s+\n/g, '\n').trim()
  const externalId = asString(mail.message_id) || asString(mail.messageId) || undefined

  if (!fromEmail || !bodyText) {
    return Response.json({ message: 'Missing sender or body.' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  try {
    // Ignore a repeat delivery of the same message — providers retry.
    if (externalId) {
      const seen = await payload.find({
        collection: 'messages',
        where: { externalId: { equals: externalId } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      if (seen.docs.length > 0) return Response.json({ ok: true, duplicate: true })
    }

    // Match the sender to a client only to file the thread correctly. This
    // grants nothing — it cannot make the message look like it came from staff.
    const account = await payload.find({
      collection: 'client-accounts',
      where: { email: { equals: fromEmail } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const clientId =
      account.docs[0] && typeof account.docs[0].client === 'object'
        ? (account.docs[0].client as { id: number }).id
        : (account.docs[0]?.client as number | undefined)

    const now = new Date().toISOString()
    const preview = bodyText.slice(0, 140)

    // Continue an existing thread where we can, so a back-and-forth reads as one
    // conversation rather than a new row per reply.
    const existing = await payload.find({
      collection: 'conversations',
      where: clientId
        ? { client: { equals: clientId } }
        : { contactEmail: { equals: fromEmail } },
      sort: '-lastMessageAt',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    let conversationId = existing.docs[0]?.id
    if (conversationId) {
      await payload.update({
        collection: 'conversations',
        id: conversationId,
        data: {
          lastMessageAt: now,
          lastMessagePreview: preview,
          unread: true,
          // A reply pulls the thread back out of archive.
          folder: 'inbox',
        } as never,
        overrideAccess: true,
      })
    } else {
      const created = await payload.create({
        collection: 'conversations',
        data: {
          subject,
          ...(clientId ? { client: clientId } : {}),
          contactName: displayName(fromRaw) || undefined,
          contactEmail: fromEmail,
          mailbox: mailboxFor(toEmail),
          folder: 'inbox',
          unread: true,
          lastMessageAt: now,
          lastMessagePreview: preview,
        } as never,
        overrideAccess: true,
      })
      conversationId = created.id
    }

    await payload.create({
      collection: 'messages',
      data: {
        conversation: conversationId,
        ...(clientId ? { client: clientId } : {}),
        body: bodyText,
        // Always 'client'. Inbound mail can never be attributed to the team.
        authorType: 'client',
        authorName: displayName(fromRaw) || fromEmail,
        direction: 'inbound',
        fromEmail,
        toEmail,
        externalId,
        readByStaff: false,
      } as never,
      overrideAccess: true,
    })

    void notifyStaff(
      {
        payload,
        type: 'messageReceived',
        title: `New mail from ${displayName(fromRaw) || fromEmail}`,
        message: preview,
        link: `/crm/mailbox?thread=${conversationId}`,
        meta: { conversationId, fromEmail },
      },
      {
        type: 'staffNewMessage',
        clientName: displayName(fromRaw) || fromEmail,
        preview,
      },
    )

    return Response.json({ ok: true, conversation: conversationId })
  } catch (err) {
    payload.logger.error(
      `inbound email failed: ${err instanceof Error ? err.message : String(err)}`,
    )
    // 500 so the provider retries rather than dropping the mail.
    return Response.json({ message: 'Could not record message.' }, { status: 500 })
  }
}
