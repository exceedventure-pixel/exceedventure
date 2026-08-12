import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notifyStaff } from '@/crm/notify'
import { sendEmail } from '@/crm/email'

/**
 * Public intake for everything the website asks visitors to send.
 *
 * THIS ROUTE DID NOT EXIST. Both the contact page and the header's quick
 * message form have been posting here since they were written, so every
 * submission 404'd and was lost. That is the bug this fixes; the enquiry
 * pipeline is what it feeds.
 *
 * Deliberately generic. `kind` decides what the submission *is* — contact,
 * message, and later pricing or quote — and anything a particular form collects
 * beyond the shared fields is kept in `details`. A new form means posting a new
 * `kind` here; no new route, no schema change.
 *
 * Two content types, because the two existing forms differ and both must work:
 *   - `application/json` from the header form's fetch → JSON response.
 *   - form-encoded from the contact page's plain `<form method="POST">` →
 *     redirect back, so it degrades correctly without JavaScript.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** The kinds a public form may claim. Anything else is filed as `other`. */
const PUBLIC_KINDS = new Set(['contact', 'message', 'pricing', 'quote', 'callback'])

/** Fields that have a column of their own; everything else lands in `details`. */
const KNOWN = new Set([
  'name',
  'email',
  'phone',
  'company',
  'subject',
  'message',
  'kind',
  'source',
  // The honeypot, never stored.
  'website_url',
])

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') ?? ''
  const isForm =
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')

  let raw: Record<string, unknown> = {}
  try {
    if (isForm) {
      raw = Object.fromEntries((await req.formData()).entries())
    } else {
      raw = (await req.json()) as Record<string, unknown>
    }
  } catch {
    return Response.json({ message: 'Invalid request body.' }, { status: 400 })
  }

  const origin = new URL(req.url).origin
  const referer = req.headers.get('referer')

  const fail = (message: string, status = 400) =>
    isForm
      ? Response.redirect(`${referer ?? `${origin}/contact`}?sent=error`, 303)
      : Response.json({ message }, { status })

  const done = () =>
    isForm
      ? Response.redirect(`${referer?.split('?')[0] ?? `${origin}/contact`}?sent=1`, 303)
      : Response.json({ ok: true })

  /**
   * Honeypot. A field no human sees and every naive bot fills in. Accepted with
   * a normal-looking response rather than rejected, so the bot has no signal to
   * adapt to — it simply never reaches the database.
   */
  if (str(raw.website_url)) return done()

  const email = str(raw.email).toLowerCase()
  const message = str(raw.message)
  const name = str(raw.name)

  if (!EMAIL_RE.test(email)) return fail('Enter a valid email address.')
  if (!message && !str(raw.subject)) return fail('Tell us what you need.')

  const requested = str(raw.kind)
  const kind = PUBLIC_KINDS.has(requested) ? requested : 'contact'

  // Anything the form sent that has no column of its own — budget, services,
  // timeline, whatever a future pricing form collects.
  const details: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (!KNOWN.has(key) && str(value)) details[key] = str(value)
  }

  const payload = await getPayload({ config: configPromise })

  try {
    const enquiry = await payload.create({
      collection: 'enquiries',
      data: {
        kind,
        name: name || undefined,
        email,
        phone: str(raw.phone) || undefined,
        company: str(raw.company) || undefined,
        subject: str(raw.subject) || undefined,
        message: message || undefined,
        details: Object.keys(details).length > 0 ? details : undefined,
        source: str(raw.source) || referer || undefined,
        status: 'new',
      } as never,
      overrideAccess: true,
    })

    const who = name || email
    const preview = (message || str(raw.subject)).slice(0, 200)

    void notifyStaff(
      {
        payload,
        type: 'accessRequested',
        title: `New ${kind === 'contact' ? 'contact form' : kind} enquiry from ${who}`,
        message: preview,
        link: `/crm/enquiries/${enquiry.id}`,
        meta: { enquiryId: enquiry.id, kind, email },
      },
      {
        type: 'custom',
        subject: `New ${kind} enquiry — ${who}`,
        heading: `New ${kind} enquiry`,
        message: `${who} (${email})${str(raw.phone) ? ` · ${str(raw.phone)}` : ''}\n\n${preview}`,
        actionUrl: `${origin}/crm/enquiries/${enquiry.id}`,
      },
    )

    // Acknowledge to the visitor, so a form submission is not a void.
    void sendEmail(email, {
      type: 'custom',
      subject: 'Thanks — we have your message',
      heading: 'Thanks for getting in touch',
      message: `Hi ${name || 'there'},\n\nWe have received your message and will come back to you within one business day.\n\nFor reference, this is what you sent:\n\n${preview}`,
    })

    return done()
  } catch (err) {
    payload.logger.error(
      `contact intake failed: ${err instanceof Error ? err.message : String(err)}`,
    )
    return fail('Could not send your message. Please try again.', 500)
  }
}
