import { headers as nextHeaders } from 'next/headers'
import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'
import { headersForAreaToken, type SessionCollection } from './session'

/**
 * Resolves the signed-in account for a CRM area, server-side.
 *
 * Reads the *area's own* cookie rather than whatever `payload.auth()` happens to
 * find. That matters now that /admin, /crm and /portal each own a cookie: a
 * plain `payload.auth()` would return the CMS user whenever someone is signed
 * into the admin panel in the same browser, and every CRM page would bounce to
 * login despite a perfectly good CRM session sitting right there.
 *
 * The collection on the token is still checked, so a portal session cannot
 * satisfy a staff lookup even if the cookie were swapped by hand.
 */
export const resolveAccount = async (
  payload: Payload,
  expected: SessionCollection,
): Promise<Record<string, unknown> | null> => {
  const cookieHeader = (await nextHeaders()).get('cookie')
  const scoped = headersForAreaToken(cookieHeader, expected)
  if (!scoped) return null

  const { user } = await payload.auth({ headers: scoped })
  if (!user) return null
  if ((user as { collection?: string }).collection !== expected) return null

  return user as unknown as Record<string, unknown>
}

/** Convenience wrapper for pages that only need the account. */
export const getAccount = async (
  expected: SessionCollection,
): Promise<{ id: string | number; email: string; name?: string } | null> => {
  const payload = await getPayload({ config: configPromise })
  const user = await resolveAccount(payload, expected)
  return user as { id: string | number; email: string; name?: string } | null
}
