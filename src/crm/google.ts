import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import { issueSession, sessionCookie, type SessionCollection } from './session'

/**
 * Google sign-in, shared by /crm (staff) and /portal (clients).
 *
 * The two audiences differ in one important way, expressed by `onMissing`:
 *
 *   staff   → 'reject'. Team logins are invite-only. Auto-creating on first
 *             Google login would hand a staff account to anyone on earth with a
 *             Google account.
 *   client  → 'createNewCompany'. Self-registration is allowed, but it always
 *             makes a brand-new `clients` record — never joins an existing one,
 *             for the same reason the password signup route does not.
 *
 * Two further rules, both easy to get wrong:
 *   - `email_verified` must be true. Otherwise someone could set an unverified
 *     Google address to a staff email and take that account over.
 *   - The Google subject id is stored on first use and checked afterwards, so an
 *     identity is bound to one account rather than re-matched by email forever.
 */

const GOOGLE_AUTH = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO = 'https://openidconnect.googleapis.com/v1/userinfo'

export type Audience = {
  collection: SessionCollection
  onMissing: 'reject' | 'createNewCompany'
  /** Where to send the browser after a successful sign-in. */
  successPath: string
  /** Where to send it on failure, with ?error= appended. */
  failurePath: string
  /** Optional Google Workspace domain restriction (the `hd` claim). */
  requireDomain?: string
}

const env = (key: string) => process.env[key]?.trim() || ''

export const googleConfigured = () =>
  Boolean(env('GOOGLE_CLIENT_ID') && env('GOOGLE_CLIENT_SECRET'))

const redirectUri = (origin: string, base: string) => `${origin}${base}/callback`

/** Step 1 — send the browser to Google. */
export const startGoogleFlow = (req: Request, basePath: string): Response => {
  if (!googleConfigured()) {
    /**
     * Bounce back to the login page rather than answering with JSON.
     *
     * This is a full browser navigation, not a fetch — a 501 body renders as a
     * page of raw JSON with no way back. The login form already has wording for
     * `not_configured`. The button is also hidden when the keys are missing, so
     * reaching this at all means a stale tab or a hand-typed URL.
     */
    const loginPath = basePath.replace(/\/api\/auth\/google$/, '/login')
    const origin = new URL(req.url).origin
    return Response.redirect(`${origin}${loginPath}?error=not_configured`, 303)
  }

  const origin = new URL(req.url).origin
  // A random value tied to the browser via cookie, checked on the way back.
  const state = crypto.randomUUID()

  const url = new URL(GOOGLE_AUTH)
  url.searchParams.set('client_id', env('GOOGLE_CLIENT_ID'))
  url.searchParams.set('redirect_uri', redirectUri(origin, basePath))
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid email profile')
  url.searchParams.set('state', state)
  url.searchParams.set('prompt', 'select_account')

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      // Short-lived, HttpOnly: this is CSRF protection for the callback.
      'Set-Cookie': `crm-oauth-state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`,
    },
  })
}

type GoogleProfile = {
  sub: string
  email?: string
  email_verified?: boolean
  name?: string
  hd?: string
}

const exchangeCode = async (code: string, origin: string, basePath: string) => {
  const res = await fetch(GOOGLE_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env('GOOGLE_CLIENT_ID'),
      client_secret: env('GOOGLE_CLIENT_SECRET'),
      redirect_uri: redirectUri(origin, basePath),
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) return null
  const json = (await res.json()) as { access_token?: string }
  if (!json.access_token) return null

  const profileRes = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${json.access_token}` },
  })
  if (!profileRes.ok) return null
  return (await profileRes.json()) as GoogleProfile
}

const fail = (origin: string, path: string, reason: string) =>
  new Response(null, {
    status: 302,
    headers: { Location: `${origin}${path}?error=${encodeURIComponent(reason)}` },
  })

/** Step 2 — Google sends the browser back here. */
export const handleGoogleCallback = async (
  req: Request,
  basePath: string,
  audience: Audience,
): Promise<Response> => {
  const url = new URL(req.url)
  const origin = url.origin

  if (!googleConfigured()) return fail(origin, audience.failurePath, 'not_configured')

  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookieState = req.headers
    .get('cookie')
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('crm-oauth-state='))
    ?.slice('crm-oauth-state='.length)

  if (!code) return fail(origin, audience.failurePath, 'no_code')
  // Reject a callback that did not originate from our own redirect.
  if (!state || !cookieState || state !== cookieState) {
    return fail(origin, audience.failurePath, 'bad_state')
  }

  const profile = await exchangeCode(code, origin, basePath)
  if (!profile?.email) return fail(origin, audience.failurePath, 'no_profile')

  // Unverified addresses are an account-takeover vector.
  if (profile.email_verified !== true) {
    return fail(origin, audience.failurePath, 'email_unverified')
  }
  if (audience.requireDomain && profile.hd !== audience.requireDomain) {
    return fail(origin, audience.failurePath, 'wrong_domain')
  }

  const email = profile.email.toLowerCase()
  const payload = await getPayload({ config: configPromise })

  const found = await payload.find({
    collection: audience.collection,
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })

  let account = found.docs[0]

  if (!account) {
    if (audience.onMissing === 'reject') {
      // Staff are invite-only, by design.
      return fail(origin, audience.failurePath, 'not_invited')
    }
    account = await createClientAccount(payload, { email, name: profile.name, sub: profile.sub })
  } else if (!account.providerAccountId) {
    // First Google login for an account created another way — bind the identity.
    account = await payload.update({
      collection: audience.collection,
      id: account.id,
      data: { provider: 'google', providerAccountId: profile.sub },
      overrideAccess: true,
    })
  } else if (account.providerAccountId !== profile.sub) {
    // Same address, different Google identity: refuse rather than assume.
    return fail(origin, audience.failurePath, 'identity_mismatch')
  }

  const { token, cookieName, maxAge } = await issueSession({
    payload,
    collection: audience.collection,
    user: { id: account.id, email },
  })

  return new Response(null, {
    status: 302,
    headers: [
      ['Location', `${origin}${audience.successPath}`],
      ['Set-Cookie', sessionCookie(cookieName, token, maxAge)],
      // Clear the one-time state cookie.
      ['Set-Cookie', 'crm-oauth-state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'],
    ],
  })
}

/** A Google-first client signup gets its own new company, same as the form route. */
const createClientAccount = async (
  payload: Payload,
  { email, name, sub }: { email: string; name?: string; sub: string },
) => {
  const client = await payload.create({
    collection: 'clients',
    data: { name: name || email, status: 'lead' },
    overrideAccess: true,
  })

  return payload.create({
    collection: 'client-accounts',
    data: {
      email,
      name,
      client: client.id,
      provider: 'google',
      providerAccountId: sub,
      // Google sign-up is still a sign-up: it waits for approval like any other.
      approvalStatus: 'pending',
      // Payload requires a password field; this one is never used to sign in.
      password: crypto.randomUUID() + crypto.randomUUID(),
    },
    overrideAccess: true,
  })
}
