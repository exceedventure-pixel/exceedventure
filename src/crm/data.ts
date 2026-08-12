import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { resolveAccount } from './auth'
import type { SessionCollection } from './session'

/**
 * Server-side data access for the CRM and portal screens.
 *
 * `as` MUST be spread into every query:
 *
 *     const { payload, as } = await crmQuery()
 *     payload.find({ collection: 'invoices', ...as })
 *
 * It carries `overrideAccess: false` as well as the request. That flag is the
 * whole point: Payload's Local API defaults to overrideAccess **true**, so
 * passing only `req` runs the query as a superuser and silently ignores
 * collection access control. That bug shipped a client portal showing every
 * client's invoices, and it looked completely normal until the data was read.
 *
 * With the flag set, the client-scoping constraint is merged into the SQL, so a
 * portal screen cannot fetch another company's rows even if the query here
 * forgets to filter.
 */

/** The signed-in account, in the shape the actions and pages actually use. */
export type CrmUser = {
  id: string | number
  email: string
  name?: string | null
  collection?: string
  role?: 'admin' | 'manager' | 'member'
  isPaused?: boolean
  approvalStatus?: string
  client?: string | number | { id: string | number }
}

/**
 * Which area the caller is in decides which cookie is read.
 *
 * Each area owns a cookie now (see session.ts), so this can no longer just ask
 * Payload "who is signed in" — the answer would be whichever of the three
 * sessions Payload noticed first. Passing the area makes it deterministic: a
 * /crm page always resolves the /crm session, even when the CMS and the portal
 * are signed in too.
 *
 * Defaults to staff because most callers are CRM screens.
 */
export const crmQuery = async (area: SessionCollection | 'any' = 'crm-accounts') => {
  const payload = await getPayload({ config: configPromise })

  let user: CrmUser | null = null
  if (area === 'any') {
    /**
     * For the handful of actions both areas share — sending a message, the
     * notification bell. Staff is tried first, which is only ambiguous for
     * someone signed into /crm and /portal at once; anything where picking the
     * wrong side would matter (editing a profile, changing a password) takes an
     * explicit area instead of relying on this.
     */
    user =
      ((await resolveAccount(payload, 'crm-accounts')) as CrmUser | null) ??
      ((await resolveAccount(payload, 'client-accounts')) as CrmUser | null)
  } else {
    user = (await resolveAccount(payload, area)) as CrmUser | null
  }

  return {
    payload,
    user,
    as: { req: { user } as never, overrideAccess: false },
  }
}

/** The client dashboard's flavour, so portal screens read the portal session. */
export const portalQuery = () => crmQuery('client-accounts')

/**
 * Turns a form's `area` field into a session collection.
 *
 * Client-supplied, and safe to be: it only chooses *which cookie to read*, and
 * that cookie is verified independently. Claiming to be staff without a valid
 * staff cookie resolves to nobody.
 */
export const areaFromForm = (value: unknown): SessionCollection =>
  value === 'staff' ? 'crm-accounts' : 'client-accounts'

/** True for a teammate who is not suspended. Mirrors the access-control rule. */
export const isStaffUser = (user: CrmUser | null): boolean =>
  Boolean(user && user.collection === 'crm-accounts' && !user.isPaused)

/** Admin and manager see the whole business; a member sees their own patch. */
export const isWideStaffUser = (user: CrmUser | null): boolean =>
  isStaffUser(user) && (user?.role === 'admin' || user?.role === 'manager')

export const isAdminUser = (user: CrmUser | null): boolean =>
  isStaffUser(user) && user?.role === 'admin'

/** Which company a portal account belongs to, unwrapped from depth. */
export const clientIdOf = (user: CrmUser | null): string | number | null => {
  const c = user?.client
  if (!c) return null
  return typeof c === 'object' ? c.id : c
}
