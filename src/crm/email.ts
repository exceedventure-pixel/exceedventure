import { Resend } from 'resend'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * Transactional email for the CRM and portal, over Resend.
 *
 * Two rules shape this file:
 *
 * 1. **Sending never breaks the thing that triggered it.** Every send is
 *    wrapped and returns a result instead of throwing. Approving a client must
 *    not fail because the mail provider is down or a key is missing — the
 *    approval is the transaction, the email is a courtesy.
 *
 * 2. **No key, no crash.** With `RESEND_API_KEY` unset the module logs once and
 *    no-ops, so local development and CI need no credentials.
 *
 * The old app rendered these with @react-email/components in the *browser* and
 * POSTed the resulting HTML to its own API — which meant any caller could post
 * arbitrary HTML to be sent from your verified domain. Templates live
 * server-side here and the caller picks a template name, never the markup.
 */

const FROM = process.env.RESEND_FROM?.trim() || 'Exceed Venture <noreply@exceedventure.com>'

let client: Resend | null = null
let warned = false

const resend = (): Resend | null => {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) {
    if (!warned) {
      warned = true
      console.warn('[email] RESEND_API_KEY not set — transactional email is disabled.')
    }
    return null
  }
  if (!client) client = new Resend(key)
  return client
}

// ── Layout ───────────────────────────────────────────────────────────────────

/** Escapes anything interpolated into an email. Names and titles are user data. */
const esc = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/**
 * The dark card layout the old templates used, as one function.
 *
 * Inline styles and a table-free single column: every client from Outlook to
 * Gmail renders this the same. `color-scheme: light only` is kept from the
 * original — without it, Gmail's dark mode inverts the already-dark card into
 * an unreadable grey.
 */
const layout = ({
  preview,
  heading,
  badge,
  body,
  action,
}: {
  preview: string
  heading: string
  badge?: string
  body: string[]
  action?: { label: string; url: string }
}): string => `<!doctype html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preview)}</div>
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">
  <p style="margin:0 0 24px;text-align:center;font-size:13px;font-weight:700;letter-spacing:2px;color:#ffffff;">✦ EXCEED VENTURE</p>
  <div style="background-color:#151515;border-radius:16px;padding:32px;">
    ${
      badge
        ? `<p style="display:inline-block;margin:0 0 20px;padding:6px 14px;border-radius:20px;background-color:rgba(99,102,241,0.15);color:#818cf8;font-size:11px;font-weight:700;letter-spacing:1px;">${esc(badge)}</p>`
        : ''
    }
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#ffffff;">${esc(heading)}</h1>
    ${body.map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#d4d4d8;">${p}</p>`).join('')}
    ${
      action
        ? `<div style="margin-top:28px;"><a href="${esc(action.url)}" style="display:inline-block;background-color:#6366f1;border-radius:8px;padding:12px 24px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">${esc(action.label)}</a></div>`
        : ''
    }
  </div>
  <p style="margin:24px 0 0;text-align:center;font-size:12px;line-height:1.6;color:#52525b;">
    Exceed Venture · <a href="${esc(getServerSideURL())}" style="color:#6366f1;text-decoration:none;">exceedventure.com</a><br>
    You are receiving this because you have an account with us.
  </p>
</div>
</body></html>`

// ── Templates ────────────────────────────────────────────────────────────────

const url = (path: string) => `${getServerSideURL()}${path}`

/**
 * Every email the system can send, keyed by name.
 *
 * A caller names a template and passes data; it cannot pass HTML. Adding a mail
 * means adding a case here, which keeps the set auditable.
 */
export type EmailTemplate =
  | { type: 'welcome'; name?: string }
  | { type: 'accessApproved'; name?: string }
  | { type: 'accessRejected'; name?: string }
  | { type: 'projectCreated'; name?: string; projectTitle: string; projectId: string | number }
  | { type: 'projectApproved'; name?: string; projectTitle: string; projectId: string | number }
  | { type: 'projectDeclined'; name?: string; projectTitle: string }
  | {
      type: 'projectStatusChanged'
      name?: string
      projectTitle: string
      status: string
      projectId: string | number
    }
  | { type: 'invoiceIssued'; name?: string; number: string; amount: string; dueDate?: string }
  | { type: 'invoiceUpdated'; name?: string; number: string; status: string }
  | { type: 'paymentRecorded'; name?: string; number: string; amount: string }
  | { type: 'messageReceived'; name?: string; from: string; preview: string }
  | { type: 'staffProjectRequest'; clientName: string; projectTitle: string; details?: string }
  | { type: 'staffAccessRequest'; clientName: string; email: string; company: string }
  | { type: 'staffDeletionRequest'; clientName: string; email: string; reason?: string }
  | { type: 'staffNewMessage'; clientName: string; preview: string }
  | { type: 'teamInvite'; name?: string; email: string; password: string; role: string }
  | { type: 'custom'; subject: string; heading: string; message: string; actionUrl?: string }

type Rendered = { subject: string; html: string }

const render = (t: EmailTemplate): Rendered => {
  const who = esc(t && 'name' in t ? t.name || 'there' : 'there')

  switch (t.type) {
    case 'welcome':
      return {
        subject: 'Welcome to Exceed Venture',
        html: layout({
          preview: 'Your Exceed Venture account has been created.',
          badge: '🎉 WELCOME ABOARD',
          heading: 'Your account is ready',
          body: [
            `Hi ${who},`,
            'Thanks for signing up. Your dashboard is where you will find your projects, invoices and everything we share with you.',
            'One thing first: a member of our team needs to approve the account before it opens up. We usually do that within one business day and will email you the moment it is done.',
          ],
          action: { label: 'Go to your dashboard', url: url('/portal') },
        }),
      }

    case 'accessApproved':
      return {
        subject: 'Your dashboard is open',
        html: layout({
          preview: 'Your Exceed Venture dashboard access has been approved.',
          badge: 'ACCESS APPROVED',
          heading: 'You are all set',
          body: [
            `Hi ${who},`,
            'Your dashboard access has been approved. You can now see your projects, track progress and view invoices any time.',
          ],
          action: { label: 'Open dashboard', url: url('/portal') },
        }),
      }

    case 'accessRejected':
      return {
        subject: 'About your dashboard request',
        html: layout({
          preview: 'An update on your Exceed Venture dashboard request.',
          heading: 'We could not approve this account',
          body: [
            `Hi ${who},`,
            'We were not able to approve dashboard access for this address. If you think that is a mistake, just reply to this email and we will take another look.',
          ],
        }),
      }

    case 'projectCreated':
      return {
        subject: `New project: ${t.projectTitle}`,
        html: layout({
          preview: `A new project has been set up for you: ${t.projectTitle}`,
          badge: '🚀 NEW PROJECT',
          heading: 'A new project is underway',
          body: [
            `Hi ${who},`,
            `We have set up <strong style="color:#ffffff;">${esc(t.projectTitle)}</strong> in your dashboard. You can follow progress there as we go.`,
          ],
          action: { label: 'View the project', url: url(`/portal/projects/${t.projectId}`) },
        }),
      }

    case 'projectApproved':
      return {
        subject: `Project approved: ${t.projectTitle}`,
        html: layout({
          preview: `${t.projectTitle} has been approved.`,
          badge: '✅ APPROVED',
          heading: 'Your project request was approved',
          body: [
            `Hi ${who},`,
            `<strong style="color:#ffffff;">${esc(t.projectTitle)}</strong> has been approved and is now active. We will be in touch shortly with next steps.`,
          ],
          action: { label: 'View the project', url: url(`/portal/projects/${t.projectId}`) },
        }),
      }

    case 'projectDeclined':
      return {
        subject: `About your request: ${t.projectTitle}`,
        html: layout({
          preview: `An update on your request: ${t.projectTitle}`,
          heading: 'An update on your project request',
          body: [
            `Hi ${who},`,
            `We were not able to take on <strong style="color:#ffffff;">${esc(t.projectTitle)}</strong> as requested. Reply to this email and we will explain and talk through the alternatives.`,
          ],
        }),
      }

    case 'projectStatusChanged':
      return {
        subject: `${t.projectTitle} is now ${t.status}`,
        html: layout({
          preview: `${t.projectTitle} moved to ${t.status}.`,
          badge: 'PROJECT UPDATE',
          heading: `${t.projectTitle} is now ${t.status}`,
          body: [
            `Hi ${who},`,
            `The status of <strong style="color:#ffffff;">${esc(t.projectTitle)}</strong> changed to <strong style="color:#ffffff;">${esc(t.status)}</strong>.`,
          ],
          action: { label: 'View the project', url: url(`/portal/projects/${t.projectId}`) },
        }),
      }

    case 'invoiceIssued':
      return {
        subject: `Invoice ${t.number} from Exceed Venture`,
        html: layout({
          preview: `Invoice ${t.number} for ${t.amount}`,
          badge: 'NEW INVOICE',
          heading: `Invoice ${t.number}`,
          body: [
            `Hi ${who},`,
            `A new invoice for <strong style="color:#ffffff;">${esc(t.amount)}</strong> is available in your dashboard${t.dueDate ? `, due ${esc(t.dueDate)}` : ''}.`,
          ],
          action: { label: 'View invoice', url: url('/portal/invoices') },
        }),
      }

    case 'invoiceUpdated':
      return {
        subject: `Invoice ${t.number} updated`,
        html: layout({
          preview: `Invoice ${t.number} is now ${t.status}.`,
          heading: `Invoice ${t.number} is now ${t.status}`,
          body: [`Hi ${who},`, 'You can see the full history in your dashboard.'],
          action: { label: 'View invoices', url: url('/portal/invoices') },
        }),
      }

    case 'paymentRecorded':
      return {
        subject: `Payment received — invoice ${t.number}`,
        html: layout({
          preview: `We have recorded your payment of ${t.amount}.`,
          badge: '✅ PAYMENT RECEIVED',
          heading: 'Thanks — payment received',
          body: [
            `Hi ${who},`,
            `We have recorded <strong style="color:#ffffff;">${esc(t.amount)}</strong> against invoice ${esc(t.number)}.`,
          ],
          action: { label: 'View invoices', url: url('/portal/invoices') },
        }),
      }

    case 'messageReceived':
      return {
        subject: 'New message from Exceed Venture',
        html: layout({
          preview: t.preview.slice(0, 120),
          heading: `${t.from} sent you a message`,
          body: [
            `Hi ${who},`,
            `<em style="color:#a1a1aa;">“${esc(t.preview.slice(0, 300))}”</em>`,
          ],
          action: { label: 'Reply in your dashboard', url: url('/portal/messages') },
        }),
      }

    // ── Internal alerts ──────────────────────────────────────────────────────

    case 'staffProjectRequest':
      return {
        subject: `New project request: ${t.projectTitle}`,
        html: layout({
          preview: `${t.clientName} requested ${t.projectTitle}`,
          badge: 'ACTION NEEDED',
          heading: 'New project request',
          body: [
            `<strong style="color:#ffffff;">${esc(t.clientName)}</strong> has requested a new project: <strong style="color:#ffffff;">${esc(t.projectTitle)}</strong>.`,
            t.details ? `<em style="color:#a1a1aa;">${esc(t.details)}</em>` : '',
          ].filter(Boolean),
          action: { label: 'Review the request', url: url('/crm/requests') },
        }),
      }

    case 'staffAccessRequest':
      return {
        subject: `New dashboard signup: ${t.clientName}`,
        html: layout({
          preview: `${t.clientName} signed up for the client dashboard.`,
          badge: 'ACTION NEEDED',
          heading: 'A new client signed up',
          body: [
            `<strong style="color:#ffffff;">${esc(t.clientName)}</strong> (${esc(t.email)}) registered under <strong style="color:#ffffff;">${esc(t.company)}</strong> and is waiting for approval.`,
            'They will see a waiting screen until someone approves them.',
          ],
          action: { label: 'Review signups', url: url('/crm/requests') },
        }),
      }

    case 'staffDeletionRequest':
      return {
        subject: `Account deletion requested: ${t.clientName}`,
        html: layout({
          preview: `${t.clientName} asked to close their account.`,
          badge: 'ACTION NEEDED',
          heading: 'Account deletion requested',
          body: [
            `<strong style="color:#ffffff;">${esc(t.clientName)}</strong> (${esc(t.email)}) has asked to close their dashboard account.`,
            t.reason ? `Reason given: <em style="color:#a1a1aa;">${esc(t.reason)}</em>` : '',
          ].filter(Boolean),
          action: { label: 'Open the CRM', url: url('/crm/requests') },
        }),
      }

    case 'staffNewMessage':
      return {
        subject: `New message from ${t.clientName}`,
        html: layout({
          preview: t.preview.slice(0, 120),
          heading: `${t.clientName} sent a message`,
          body: [`<em style="color:#a1a1aa;">“${esc(t.preview.slice(0, 300))}”</em>`],
          action: { label: 'Open the mailbox', url: url('/crm/mailbox') },
        }),
      }

    case 'teamInvite':
      return {
        subject: 'Your Exceed Venture CRM account',
        html: layout({
          preview: 'An account has been created for you.',
          badge: 'TEAM ACCESS',
          heading: 'Your CRM account is ready',
          body: [
            `Hi ${who},`,
            `An account has been created for you as <strong style="color:#ffffff;">${esc(t.role)}</strong>.`,
            `Sign in with <strong style="color:#ffffff;">${esc(t.email)}</strong> and this temporary password: <strong style="color:#ffffff;">${esc(t.password)}</strong>`,
            'Please change it from your profile once you are in.',
          ],
          action: { label: 'Sign in', url: url('/crm/login') },
        }),
      }

    case 'custom':
      return {
        subject: t.subject,
        html: layout({
          preview: t.subject,
          heading: t.heading,
          body: [esc(t.message).replace(/\n/g, '<br>')],
          action: t.actionUrl ? { label: 'Open', url: t.actionUrl } : undefined,
        }),
      }
  }
}

/**
 * The password-reset email, rendered for Payload's own `forgotPassword` flow.
 *
 * Payload's built-in version is unbranded and links to /admin, which is the
 * wrong destination for both a client and a teammate. This keeps the reset in
 * the same visual language as everything else we send.
 */
export const renderPasswordResetEmail = ({
  name,
  url,
}: {
  name?: string
  url: string
}): string =>
  layout({
    preview: 'Reset your Exceed Venture password.',
    badge: 'PASSWORD RESET',
    heading: 'Set a new password',
    body: [
      `Hi ${esc(name || 'there')},`,
      'Use the button below to choose a new password. The link is valid for one hour.',
      'If you did not ask for this, you can ignore this email — your password has not changed.',
    ],
    action: { label: 'Set a new password', url },
  })

// ── Sending ──────────────────────────────────────────────────────────────────

export type SendResult = { sent: boolean; skipped?: boolean; error?: string }

/**
 * Sends one template. Never throws — callers treat email as best-effort.
 *
 * `from` overrides the default sender for mail the team writes from a specific
 * address — the shared mailbox sends as support@ or sales@ rather than as the
 * no-reply address the automated templates use. It must still be on the domain
 * verified in Resend; `senderFor` in mailbox-actions guarantees that.
 */
export const sendEmail = async (
  to: string | string[],
  template: EmailTemplate,
  options?: { from?: string; replyTo?: string },
): Promise<SendResult> => {
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean)
  if (recipients.length === 0) return { sent: false, skipped: true }

  const api = resend()
  if (!api) return { sent: false, skipped: true }

  try {
    const { subject, html } = render(template)
    const { error } = await api.emails.send({
      from: options?.from?.trim() || FROM,
      to: recipients,
      subject,
      html,
      ...(options?.replyTo ? { replyTo: options.replyTo } : {}),
    })
    if (error) {
      console.error(`[email] ${template.type} failed: ${error.message}`)
      return { sent: false, error: error.message }
    }
    return { sent: true }
  } catch (err) {
    console.error(`[email] ${template.type} threw: ${err instanceof Error ? err.message : err}`)
    return { sent: false, error: 'send failed' }
  }
}

/** True when a key is configured — lets the UI say whether email is live. */
export const emailConfigured = (): boolean => Boolean(process.env.RESEND_API_KEY?.trim())

// ── Receiving ────────────────────────────────────────────────────────────────

/**
 * Verifies that an inbound webhook really came from Resend.
 *
 * Resend signs every delivery and gives you a signing secret (`whsec_…`) when
 * you create the webhook. This is stronger than the shared token the route also
 * accepts: the signature covers the body and a timestamp, so a replayed or
 * edited payload fails, and unlike a token in the URL it never lands in an
 * access log or a proxy's request history.
 *
 * Returns false when a secret is configured and the signature does not check
 * out. Returns null when no secret is configured, which leaves the decision to
 * the caller rather than silently passing.
 */
export const verifyInboundSignature = (
  rawBody: string,
  headers: { id?: string | null; timestamp?: string | null; signature?: string | null },
): boolean | null => {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim()
  if (!secret) return null

  const { id, timestamp, signature } = headers
  if (!id || !timestamp || !signature) return false

  const api = resend()
  if (!api) return false

  try {
    api.webhooks.verify({
      payload: rawBody,
      headers: { id, timestamp, signature },
      webhookSecret: secret,
    })
    return true
  } catch (err) {
    console.warn(
      `[email] inbound webhook signature rejected: ${err instanceof Error ? err.message : String(err)}`,
    )
    return false
  }
}

export type ReceivedEmail = {
  from: string
  to: string
  subject: string
  text: string
  html: string
  messageId?: string
}

/**
 * Fetches the body of an inbound message by id.
 *
 * Resend's `email.received` webhook carries metadata only — sender, recipients,
 * subject, attachment names — and deliberately omits the body, headers and
 * attachments so that a large attachment cannot exceed the request size limit
 * of whatever receives the hook. The content is a second call, and this is it.
 *
 * Returns null rather than throwing; the caller decides whether a missing body
 * is worth asking the provider to retry.
 */
export const fetchReceivedEmail = async (id: string): Promise<ReceivedEmail | null> => {
  const api = resend()
  if (!api) return null

  try {
    const { data, error } = await api.emails.receiving.get(id)
    if (error || !data) {
      console.error(`[email] could not fetch inbound ${id}: ${error?.message ?? 'no data returned'}`)
      return null
    }

    return {
      from: data.from,
      // `to` is who it was addressed to; `received_for` is the address of ours
      // it actually arrived at, which is what decides the mailbox label.
      to: data.received_for?.[0] || data.to?.[0] || '',
      subject: data.subject,
      text: data.text ?? '',
      html: data.html ?? '',
      messageId: data.message_id,
    }
  } catch (err) {
    console.error(
      `[email] fetching inbound ${id} threw: ${err instanceof Error ? err.message : String(err)}`,
    )
    return null
  }
}

/**
 * Payload's own transactional email, over the same Resend client.
 *
 * Payload generates a few emails itself — above all the **password reset**
 * link. Without an adapter it writes them to the console, which means the reset
 * flow silently does nothing in production and anyone who forgets their
 * password is stuck contacting you.
 *
 * A small adapter rather than `@payloadcms/email-resend`, so there is one
 * Resend client, one API key and one From address across the whole app instead
 * of two that can drift apart.
 */
export const resendAdapter = () => {
  const fromMatch = FROM.match(/^\s*(.*?)\s*<(.+)>\s*$/)
  const defaultFromName = fromMatch?.[1] || 'Exceed Venture'
  const defaultFromAddress = fromMatch?.[2] || FROM

  return () => ({
    name: 'resend',
    defaultFromAddress,
    defaultFromName,
    sendEmail: async (message: {
      to?: unknown
      subject?: string
      html?: unknown
      text?: unknown
      from?: string
    }) => {
      const api = resend()
      // No key configured: fall back to Payload's own behaviour of logging,
      // rather than throwing and breaking whatever triggered the email.
      if (!api) {
        console.warn(
          `[email] RESEND_API_KEY not set — not sending "${message.subject ?? '(no subject)'}".`,
        )
        return { id: 'not-sent' }
      }

      const recipients = (Array.isArray(message.to) ? message.to : [message.to])
        .map((entry) =>
          typeof entry === 'string' ? entry : ((entry as { address?: string })?.address ?? ''),
        )
        .filter(Boolean) as string[]

      if (recipients.length === 0) return { id: 'no-recipient' }

      const html = typeof message.html === 'string' ? message.html : undefined
      const text = typeof message.text === 'string' ? message.text : undefined

      try {
        const { data, error } = await api.emails.send({
          from: message.from || FROM,
          to: recipients,
          subject: message.subject ?? '',
          ...(html ? { html } : { text: text ?? '' }),
        } as Parameters<Resend['emails']['send']>[0])

        if (error) {
          console.error(`[email] payload adapter failed: ${error.message}`)
          return { id: 'failed' }
        }
        return { id: data?.id ?? 'sent' }
      } catch (err) {
        console.error(
          `[email] payload adapter threw: ${err instanceof Error ? err.message : String(err)}`,
        )
        return { id: 'failed' }
      }
    },
  })
}
