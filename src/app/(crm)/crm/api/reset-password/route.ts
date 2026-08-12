import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { issueSession, sessionCookie } from '@/crm/session'

/**
 * Completes a password reset for this area.
 *
 * Payload's own /api/crm-accounts/reset-password does the right thing to the
 * password but signs you in via the shared `payload-token`, which would clobber
 * the CMS session. The Local API resets without touching cookies, so the new
 * session can be issued under this area's own cookie.
 */
export async function POST(req: Request) {
  let body: { token?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ message: 'Invalid request body.' }, { status: 400 })
  }

  const token = body.token?.trim() ?? ''
  const password = body.password ?? ''
  if (!token) return Response.json({ message: 'Missing reset token.' }, { status: 400 })
  if (password.length < 10) {
    return Response.json({ message: 'Use at least 10 characters.' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  try {
    const result = await payload.resetPassword({
      collection: 'crm-accounts',
      data: { token, password },
      overrideAccess: true,
    })
    if (!result?.user) throw new Error('no user')

    const { token: sessionToken, cookieName, maxAge } = await issueSession({
      payload,
      collection: 'crm-accounts',
      // resetPassword types the user loosely; the shape is guaranteed by the
      // collection's auth config.
      user: result.user as { id: string | number; email: string },
    })

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': sessionCookie(cookieName, sessionToken, maxAge),
      },
    })
  } catch {
    return Response.json(
      { message: 'That link has expired or has already been used.' },
      { status: 400 },
    )
  }
}
