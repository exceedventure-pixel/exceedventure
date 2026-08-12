import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cookieNameFor, sessionCookie } from '@/crm/session'

/**
 * Password sign-in for the team CRM.
 *
 * Payload's own /api/crm-accounts/login would work, but it sets the shared
 * `payload-token` cookie — which overwrites whichever of the three sessions is
 * already there. This mints the identical token and stores it under this area's
 * own cookie instead, so signing in here leaves /admin and the other area alone.
 *
 * `payload.login` via the Local API returns the token without setting a cookie,
 * which is exactly what is needed.
 */
export async function POST(req: Request) {
  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ message: 'Invalid request body.' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase() ?? ''
  const password = body.password ?? ''
  if (!email || !password) {
    return Response.json({ message: 'Enter your email and password.' }, { status: 400 })
  }

  const payload = await getPayload({ config: configPromise })

  try {
    const result = await payload.login({
      collection: 'crm-accounts',
      data: { email, password },
      overrideAccess: true,
    })
    if (!result?.user) throw new Error('no user')

    // payload.login already registered a session and returned a token bound to
    // it — re-minting here would produce a token with no matching session.
    const token = result.token!
    const maxAge = payload.collections['crm-accounts']!.config.auth.tokenExpiration ?? 7200
    const cookieName = cookieNameFor('crm-accounts')

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': sessionCookie(cookieName, token, maxAge),
      },
    })
  } catch {
    // Deliberately identical whether the address is unknown or the password is
    // wrong, so this cannot be used to discover who has an account.
    return Response.json({ message: 'Those details were not accepted.' }, { status: 401 })
  }
}
