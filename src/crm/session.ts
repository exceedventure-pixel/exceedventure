import { getFieldsToSign, jwtSign, type Payload } from 'payload'

/**
 * Sessions for the CRM and the client dashboard.
 *
 * WHY THESE DO NOT USE PAYLOAD'S COOKIE.
 *
 * Payload derives its cookie name from a single global `cookiePrefix`, so every
 * auth collection in the app shares one `payload-token`. With three login
 * surfaces that is not a cosmetic detail — it means signing into /crm
 * *overwrites* the /admin session, and the CMS then reports "unauthorized"
 * because the token it finds belongs to a different collection. Logging out of
 * one area cannot clear the others, so you end up in a loop.
 *
 * Payload offers no per-collection cookie name (`auth.cookies` covers only
 * domain, sameSite and secure), so each area is given its own cookie here:
 *
 *   /admin  → payload-token     (Payload's own, left completely alone)
 *   /crm    → ev-crm-token
 *   /portal → ev-portal-token
 *
 * All three can now be signed in at once in one browser, which is the whole
 * point of keeping the account collections separate.
 *
 * The token itself is minted exactly the way Payload's own login does — same
 * `getFieldsToSign`, same `jwtSign`, same secret — so it is a genuine Payload
 * session, just stored under a name only its own area reads.
 */

export type SessionCollection = 'crm-accounts' | 'client-accounts'

/** The cookie each area owns. Deliberately not `payload-*` — see above. */
export const SESSION_COOKIES: Record<SessionCollection, string> = {
  'crm-accounts': 'ev-crm-token',
  'client-accounts': 'ev-portal-token',
}

export const cookieNameFor = (collection: SessionCollection): string =>
  SESSION_COOKIES[collection]

/**
 * Mints a session for an account that authenticated without a password —
 * Google today, SMS one-time codes later.
 *
 * A SESSION RECORD IS NOT OPTIONAL. Payload 3 stores active sessions on the
 * user (`crm_accounts_sessions`, `client_accounts_sessions`) and its JWT
 * strategy refuses any token whose `sid` does not match one of them. A token
 * signed without registering a session verifies fine and then authenticates
 * nobody — silently, with no error, which is exactly how long that took to
 * find.
 *
 * `addSessionToUser` is internal to Payload, so the same few steps are done
 * here: register the session, then sign a token carrying its id.
 */
export const issueSession = async ({
  payload,
  collection,
  user,
}: {
  payload: Payload
  collection: SessionCollection
  user: { id: string | number; email: string }
}): Promise<{ token: string; cookieName: string; maxAge: number }> => {
  const collectionConfig = payload.collections[collection]?.config
  if (!collectionConfig) throw new Error(`Unknown auth collection: ${collection}`)

  const tokenExpiration = collectionConfig.auth?.tokenExpiration ?? 7200

  let sid: string | undefined
  if (collectionConfig.auth?.useSessions) {
    sid = crypto.randomUUID()
    const now = new Date()

    const current = (await payload.findByID({
      collection,
      id: user.id,
      depth: 0,
      overrideAccess: true,
    })) as { sessions?: { id: string; createdAt: Date; expiresAt: Date }[] }

    // Drop anything already expired while we are here, so the array does not
    // grow without bound for someone who signs in often.
    const live = (current.sessions ?? []).filter(
      (s) => new Date(s.expiresAt).getTime() > now.getTime(),
    )

    await payload.db.updateOne({
      collection,
      id: user.id,
      data: {
        sessions: [
          ...live,
          { id: sid, createdAt: now, expiresAt: new Date(now.getTime() + tokenExpiration * 1000) },
        ],
        // Registering a session is not the user editing their profile.
        updatedAt: null,
      } as never,
      returning: false,
    })
  }

  const fieldsToSign = getFieldsToSign({
    collectionConfig,
    email: user.email,
    ...(sid ? { sid } : {}),
    user: { ...user, collection } as never,
  } as never)

  const { token } = await jwtSign({
    fieldsToSign,
    secret: payload.secret,
    tokenExpiration,
  })

  return { token, cookieName: cookieNameFor(collection), maxAge: tokenExpiration }
}

/** Cookie attributes matching what Payload sets on a normal login. */
export const sessionCookie = (name: string, token: string, maxAge: number): string => {
  const secure = process.env.NODE_ENV === 'production'
  return [
    `${name}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    secure ? 'Secure' : '',
    `Max-Age=${maxAge}`,
  ]
    .filter(Boolean)
    .join('; ')
}

/** Expires one area's cookie without touching the other two. */
export const clearedSessionCookie = (name: string): string => {
  const secure = process.env.NODE_ENV === 'production'
  return [`${name}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', secure ? 'Secure' : '', 'Max-Age=0']
    .filter(Boolean)
    .join('; ')
}

/** Pulls one cookie out of a raw Cookie header. */
export const readCookie = (cookieHeader: string | null, name: string): string | undefined => {
  if (!cookieHeader) return undefined
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return rest.join('=')
  }
  return undefined
}

/**
 * Headers that present an area's token to Payload under the name Payload
 * verifies — `payload-token`.
 *
 * The token IS a genuine Payload session (same signing path as its own login),
 * it is simply stored under a different cookie so the three areas do not
 * overwrite one another. Handing it back this way means Payload does the
 * signature and expiry checking, rather than this app re-implementing JWT
 * verification with its own crypto.
 *
 * Returns null when the area has no cookie, so callers can treat "no session"
 * and "bad session" identically.
 */
export const headersForAreaToken = (
  cookieHeader: string | null,
  collection: SessionCollection,
): Headers | null => {
  const token = readCookie(cookieHeader, cookieNameFor(collection))
  if (!token) return null
  return new Headers({ cookie: `payload-token=${token}` })
}
