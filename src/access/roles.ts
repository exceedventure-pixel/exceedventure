import type { Access, FieldAccess, PayloadRequest, Where } from 'payload'

/**
 * Roles for the CMS at /admin.
 *
 * Three levels, and the boundaries are about *damage*, not seniority:
 *
 *   superAdmin — everything, including other admins. Provisioned from the
 *                environment and protected from being demoted or deleted, so
 *                there is always a way back in.
 *   admin      — everything except touching a superAdmin. Runs the site day to
 *                day: content, media, settings, inviting editors.
 *   editor     — content only. Cannot create logins, change roles, or edit the
 *                site's contact details.
 *
 * The CRM has its own parallel set (admin / manager / member) in `crm.ts`. They
 * are deliberately separate: they govern different collections and different
 * products, and one shared enum would invite a bug in one to grant access in
 * the other.
 */

export const CMS = 'users'

export type CmsRole = 'superAdmin' | 'admin' | 'editor'

type CmsUser = { collection?: string; role?: CmsRole; email?: string }

/**
 * A CMS account — and *only* a CMS account.
 *
 * The old `authenticated` helper was `Boolean(user)`, which is true for any
 * signed-in account of any collection. Nothing exploits that today because the
 * CRM and portal use their own cookies, but "no current path to it" is a weak
 * thing to rest content permissions on.
 */
const cmsUserOf = (user: unknown): CmsUser | null => {
  const u = user as CmsUser | null
  return u && u.collection === CMS ? u : null
}

const rankOf = (role?: CmsRole): number =>
  role === 'superAdmin' ? 3 : role === 'admin' ? 2 : role === 'editor' ? 1 : 0

/** Signed in to the CMS at all. Enough to work on content. */
export const isCmsUser: Access = ({ req: { user } }) => Boolean(cmsUserOf(user))

/** Admin or above — user management, site settings. */
export const isCmsAdmin: Access = ({ req: { user } }) => rankOf(cmsUserOf(user)?.role) >= 2

/** The top of the tree. */
export const isCmsSuperAdmin: Access = ({ req: { user } }) =>
  rankOf(cmsUserOf(user)?.role) >= 3

/** Field guard: only an admin may set it. */
export const cmsAdminField: FieldAccess = ({ req: { user } }) =>
  rankOf((user as CmsUser | null)?.collection === CMS ? (user as CmsUser).role : undefined) >= 2

/** Field guard: only a superAdmin may set it. */
export const cmsSuperAdminField: FieldAccess = ({ req: { user } }) =>
  rankOf((user as CmsUser | null)?.collection === CMS ? (user as CmsUser).role : undefined) >= 3

/**
 * Reading the user list: admins see everyone, an editor sees only themselves.
 *
 * An editor has no reason to enumerate the team, and a list of every colleague's
 * email address is the kind of thing that should need a reason.
 */
export const canReadCmsUsers: Access = ({ req: { user } }) => {
  const me = cmsUserOf(user)
  if (!me) return false
  if (rankOf(me.role) >= 2) return true
  return { id: { equals: (me as { id?: string | number }).id } } as Where
}

/**
 * Editing a user: admins edit anyone below them, everyone edits themselves.
 *
 * Rank is compared rather than checking for one role, so an admin cannot edit a
 * superAdmin — which is what stops the recovery account being locked out or
 * quietly renamed by someone with almost enough privilege.
 */
export const canUpdateCmsUser: Access = ({ req: { user } }) => {
  const me = cmsUserOf(user)
  if (!me) return false
  if (rankOf(me.role) >= 3) return true
  // Annotated so the branches do not widen into a union Payload's Where rejects.
  if (rankOf(me.role) >= 2) {
    // Admins: everyone except superAdmins.
    return { role: { not_equals: 'superAdmin' } } as Where
  }
  return { id: { equals: (me as { id?: string | number }).id } } as Where
}

/** Deleting: admins only, and never a superAdmin. */
export const canDeleteCmsUser: Access = ({ req: { user } }) => {
  const me = cmsUserOf(user)
  if (!me) return false
  if (rankOf(me.role) >= 3) return true
  if (rankOf(me.role) >= 2) return { role: { not_equals: 'superAdmin' } } as Where
  return false
}

/** Rank comparison for code outside access functions. */
export const cmsRank = rankOf

/**
 * Boolean-only variant for `access.admin`, which gates reaching /admin at all.
 *
 * Payload types that one as returning a plain boolean — a query constraint has
 * no meaning for "can this person open the admin panel".
 */
export const canAccessAdminPanel = ({ req }: { req: PayloadRequest }): boolean =>
  Boolean(cmsUserOf(req.user))
