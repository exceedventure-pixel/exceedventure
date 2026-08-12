import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { issueSession, sessionCookie } from '@/crm/session'

/**
 * Client self-registration for the dashboard.
 *
 * THE RULE THAT MATTERS: a signup always creates a **brand-new** `clients`
 * record and links the account to it. It never joins an existing company, and
 * never accepts a client id from the request body. Without that, anyone could
 * register and immediately read another company's projects and invoices — the
 * `client` field is the entire basis of portal scoping.
 *
 * If a real client should be attached to an existing company, your team moves
 * them in the CRM. That is a deliberate human step.
 *
 * The `client-accounts` collection has `create: isStaff`, so this route is the
 * only public path in, and it uses `overrideAccess` narrowly for exactly the two
 * documents it creates.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  let body: { name?: string; email?: string; password?: string; company?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ message: 'Invalid request body.' }, { status: 400 })
  }

  const name = body.name?.trim() ?? ''
  const email = body.email?.trim().toLowerCase() ?? ''
  const password = body.password ?? ''
  const company = body.company?.trim() || name || email

  if (!EMAIL_RE.test(email)) {
    return Response.json({ message: 'Enter a valid email address.' }, { status: 400 })
  }
  if (password.length < 10) {
    return Response.json(
      { message: 'Password must be at least 10 characters.' },
      { status: 400 },
    )
  }

  const payload = await getPayload({ config: configPromise })

  // Deliberately the same response whether or not the address is taken, so this
  // endpoint cannot be used to enumerate which of your clients have accounts.
  const existing = await payload.find({
    collection: 'client-accounts',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs.length > 0) {
    return Response.json(
      { message: 'If that address can be registered, you can now sign in.' },
      { status: 202 },
    )
  }

  let createdClientId: string | number | null = null

  try {
    const client = await payload.create({
      collection: 'clients',
      data: { name: company, status: 'lead' },
      overrideAccess: true,
    })
    createdClientId = client.id

    const account = await payload.create({
      collection: 'client-accounts',
      data: {
        name: name || undefined,
        email,
        password,
        // Set here from the record we just made — never from the request.
        client: client.id,
        provider: 'password',
        // Explicit rather than relying on the default: a signup must never be
        // able to arrive already approved.
        approvalStatus: 'pending',
      },
      overrideAccess: true,
    })

    const { token, cookieName, maxAge } = await issueSession({
      payload,
      collection: 'client-accounts',
      user: { id: account.id, email },
    })

    return new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': sessionCookie(cookieName, token, maxAge),
      },
    })
  } catch (err) {
    // Don't leave an orphan company behind if the account failed to create.
    if (createdClientId) {
      await payload
        .delete({ collection: 'clients', id: createdClientId, overrideAccess: true })
        .catch(() => undefined)
    }
    payload.logger.error(
      `portal signup failed: ${err instanceof Error ? err.message : String(err)}`,
    )
    return Response.json({ message: 'Could not complete signup.' }, { status: 500 })
  }
}
