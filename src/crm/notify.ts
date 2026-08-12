import type { Payload } from 'payload'
import { sendEmail, type EmailTemplate } from './email'

/**
 * Raising notifications — the in-app bell and the matching email, together.
 *
 * The old app fired these from the browser: `notifications.js` looped over every
 * admin, wrote a Firestore doc for each and POSTed an email per admin, all from
 * whichever client happened to trigger the event. That put the recipient list in
 * the hands of the sender, and meant a client could address a notification to
 * anyone by editing the payload. Here it runs on the server, and every function
 * decides its own recipients from the database.
 *
 * Two invariants:
 *
 *   - **Nothing here throws.** A failed notification must never roll back the
 *     approval, invoice or message that caused it. Every entry point is wrapped.
 *   - **`overrideAccess: true` is deliberate.** These writes are the system
 *     speaking, not the signed-in account: a client's message has to create a
 *     notification addressed to *staff*, which their own permissions rightly
 *     forbid. The recipient is always computed here, never taken from a request.
 */

type NotificationType =
  | 'general'
  | 'projectRequested'
  | 'projectApproved'
  | 'projectDeclined'
  | 'projectCreated'
  | 'projectStatusChanged'
  | 'taskAdded'
  | 'taskUpdated'
  | 'invoiceIssued'
  | 'invoiceUpdated'
  | 'paymentRecorded'
  | 'accessRequested'
  | 'accessApproved'
  | 'accessRejected'
  | 'deletionRequested'
  | 'messageReceived'
  | 'resourceShared'

type Base = {
  payload: Payload
  type: NotificationType
  title: string
  message?: string
  link?: string
  meta?: Record<string, unknown>
}

const log = (payload: Payload, err: unknown, what: string) => {
  payload.logger.error(`[notify] ${what}: ${err instanceof Error ? err.message : String(err)}`)
}

// ── Writing rows ─────────────────────────────────────────────────────────────

const createFor = async (
  { payload, type, title, message, link, meta }: Base,
  recipient: { recipientType: 'staff'; staffRecipient: string | number } | { recipientType: 'client'; clientRecipient: string | number },
) => {
  try {
    await payload.create({
      collection: 'notifications',
      data: { type, title, message, link, meta, read: false, ...recipient } as never,
      overrideAccess: true,
    })
  } catch (err) {
    log(payload, err, `create ${type}`)
  }
}

/**
 * Everyone who should hear about something needing a decision.
 *
 * Admins and managers, never members: the old rule was "role == admin", but a
 * manager runs clients day to day and is exactly who should see a new signup.
 * Paused accounts are excluded — a suspended teammate should not be emailed.
 */
const decisionMakers = async (payload: Payload) => {
  try {
    const res = await payload.find({
      collection: 'crm-accounts',
      where: { and: [{ role: { in: ['admin', 'manager'] } }, { isPaused: { not_equals: true } }] },
      limit: 100,
      depth: 0,
      pagination: false,
      overrideAccess: true,
    })
    return res.docs
  } catch (err) {
    log(payload, err, 'load staff recipients')
    return []
  }
}

/** The portal logins for a company, so a client-facing event reaches a person. */
const accountsForClient = async (payload: Payload, clientId: string | number) => {
  try {
    const res = await payload.find({
      collection: 'client-accounts',
      where: { and: [{ client: { equals: clientId } }, { approvalStatus: { equals: 'active' } }] },
      limit: 50,
      depth: 0,
      pagination: false,
      overrideAccess: true,
    })
    return res.docs
  } catch (err) {
    log(payload, err, 'load client recipients')
    return []
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Alerts every admin and manager, in-app and by email. */
export const notifyStaff = async (
  base: Omit<Base, 'type'> & { type: NotificationType },
  email?: EmailTemplate,
): Promise<void> => {
  const team = await decisionMakers(base.payload)
  if (team.length === 0) return

  await Promise.all(
    team.map((member) =>
      createFor(base, { recipientType: 'staff', staffRecipient: member.id }),
    ),
  )

  if (email) {
    const addresses = team.map((m) => m.email).filter(Boolean)
    // One send with many recipients rather than one per person, which is what
    // made the old version slow enough to be noticeable on approve.
    if (addresses.length > 0) await sendEmail(addresses, email)
  }
}

/** Alerts every active portal account for a client, in-app and by email. */
export const notifyClient = async (
  base: Omit<Base, 'type'> & { type: NotificationType; clientId: string | number },
  email?: (recipientName?: string) => EmailTemplate,
): Promise<void> => {
  const accounts = await accountsForClient(base.payload, base.clientId)
  if (accounts.length === 0) return

  await Promise.all(
    accounts.map(async (account) => {
      await createFor(base, { recipientType: 'client', clientRecipient: account.id })
      if (email && account.email) {
        await sendEmail(account.email, email(account.name ?? undefined))
      }
    }),
  )
}

/** Alerts one specific person, whichever side they are on. */
export const notifyAccount = async (
  base: Omit<Base, 'type'> & {
    type: NotificationType
    side: 'staff' | 'client'
    accountId: string | number
  },
  email?: { to: string; template: EmailTemplate },
): Promise<void> => {
  await createFor(
    base,
    base.side === 'staff'
      ? { recipientType: 'staff', staffRecipient: base.accountId }
      : { recipientType: 'client', clientRecipient: base.accountId },
  )
  if (email?.to) await sendEmail(email.to, email.template)
}

/** Unread count for the bell. Returns 0 rather than failing the page render. */
export const unreadCount = async (
  payload: Payload,
  side: 'staff' | 'client',
  accountId: string | number,
): Promise<number> => {
  try {
    const res = await payload.count({
      collection: 'notifications',
      where: {
        and: [
          { read: { not_equals: true } },
          side === 'staff'
            ? { staffRecipient: { equals: accountId } }
            : { clientRecipient: { equals: accountId } },
        ],
      },
      overrideAccess: true,
    })
    return res.totalDocs
  } catch {
    return 0
  }
}
