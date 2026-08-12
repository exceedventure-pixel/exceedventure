import type { Access, FieldAccess, PayloadRequest, Where } from 'payload'

/**
 * Access control for the CRM and the client dashboard.
 *
 * There are three separate account collections, deliberately:
 *
 *   users           → the CMS admin at /admin
 *   crm-accounts    → your team, at /crm
 *   client-accounts → clients, at /portal
 *
 * They are different collections, not one collection with a role column. That
 * means a client cannot be escalated into staff by flipping a field — there is
 * no field to flip. The boundary is structural, the same way `admin.user`
 * structurally keeps both CRM collections out of /admin.
 *
 * Client scoping returns a *query constraint* rather than a boolean, so Payload
 * merges it into the SQL. A client cannot reach another client's rows even with
 * a hand-crafted request. Member scoping (below) works the same way, so the
 * narrowest account still cannot widen its view by crafting a request.
 */

export const STAFF = 'crm-accounts'
export const CLIENT = 'client-accounts'

type Account = {
  id?: string | number
  collection?: string
  role?: 'admin' | 'manager' | 'member'
  approvalStatus?: string
  isPaused?: boolean
  client?: string | number | { id: string | number }
}

/**
 * A staff account, but ONLY while it is active.
 *
 * A paused teammate keeps a valid session until it expires — the old CRM's
 * "pause access" only hid buttons, which meant a paused account could still
 * write through the API. Gating here, at the one place every staff rule already
 * routes through, makes the pause real.
 */
const staffOf = (user: unknown): Account | null => {
  const u = user as Account | null
  if (!u || u.collection !== STAFF) return null
  if (u.isPaused) return null
  return u
}

/**
 * A portal account, but ONLY once your team has approved it.
 *
 * Signups land as `pending`, and paused/rejected accounts keep a valid session
 * until it expires. Gating here — the single choke point every client-scoped
 * rule already routes through — means an unapproved account reads nothing,
 * rather than each collection having to remember the check.
 */
const clientOf = (user: unknown): Account | null => {
  const u = user as Account | null
  if (!u || u.collection !== CLIENT) return null
  if (u.approvalStatus !== 'active') return null
  return u
}

/** Signed in to the portal at all, approved or not — for the waiting screen. */
const anyClientOf = (user: unknown): Account | null => {
  const u = user as Account | null
  return u && u.collection === CLIENT ? u : null
}

/** Which client a portal account belongs to. */
const clientIdOf = (account: Account): string | number | null => {
  const c = account.client
  if (!c) return null
  return typeof c === 'object' ? c.id : c
}

/**
 * "You may look, but nothing here is yours."
 *
 * Returning `false` from a read rule is NOT the same as returning an empty
 * list: Payload's `executeAccess` throws `Forbidden`, so `find` and `count`
 * reject and the whole page 500s. A member who simply has no clients assigned
 * yet is authorised — they just have nothing — and must get empty tables, not
 * an error. So the empty-scope case returns a constraint that cannot match
 * instead.
 *
 * Ids are serial integers starting at 1, so 0 matches no row.
 *
 * `false` is still correct where the caller genuinely has no business here at
 * all — signed out, wrong collection, or suspended.
 */
const MATCHES_NOTHING: Where = { id: { equals: 0 } }

/** Admin and manager see the whole business; a member sees only assigned work. */
const isWideStaff = (account: Account | null): boolean =>
  account?.role === 'admin' || account?.role === 'manager'

/** Any member of your team. */
export const isStaff: Access = ({ req: { user } }) => Boolean(staffOf(user))

/** Admins only — account management and billing settings. */
export const isStaffAdmin: Access = ({ req: { user } }) => staffOf(user)?.role === 'admin'

/** Admin or manager — running clients, projects and invoices. */
export const isManager: Access = ({ req: { user } }) => isWideStaff(staffOf(user))

/** A signed-in portal user. */
export const isClientAccount: Access = ({ req: { user } }) => Boolean(clientOf(user))

/** Either kind of CRM login — used for "read your own record". */
export const isAnyAccount: Access = ({ req: { user } }) =>
  Boolean(staffOf(user) || anyClientOf(user))

// ── Member scoping ───────────────────────────────────────────────────────────

/**
 * The clients a member has been put on, memoised per request.
 *
 * A member's project list is "projects assigned to me, plus every project of a
 * client assigned to me" — the second half needs a lookup, and access control
 * runs on nearly every query. Without the memo, listing projects would issue one
 * extra clients query per collection touched. `req` is a fresh object per HTTP
 * request, so the cache cannot leak between users.
 */
type ScopedReq = PayloadRequest & { _crmAssignedClients?: Promise<(string | number)[]> }

const assignedClientIds = async (req: PayloadRequest, staffId: string | number) => {
  const cached = (req as ScopedReq)._crmAssignedClients
  if (cached) return cached

  const load = req.payload
    .find({
      collection: 'clients',
      where: { assignedTo: { contains: staffId } },
      limit: 500,
      depth: 0,
      pagination: false,
      overrideAccess: true,
    })
    .then((res) => res.docs.map((d) => d.id))
    // A failed lookup must narrow, never widen: no clients rather than all.
    .catch(() => [] as (string | number)[])

  ;(req as ScopedReq)._crmAssignedClients = load
  return load
}

/**
 * Staff see everything; a portal user sees only rows belonging to their own
 * client. `field` is the path on the collection pointing at `clients`.
 */
export const isStaffOrOwnClient =
  (field = 'client'): Access =>
  ({ req: { user } }) => {
    if (staffOf(user)) return true

    const account = clientOf(user)
    if (!account) return false

    const clientId = clientIdOf(account)
    // An account with no client attached sees nothing, rather than falling
    // through to an unfiltered read.
    if (!clientId) return MATCHES_NOTHING

    return { [field]: { equals: clientId } }
  }

/**
 * Like `isStaffOrOwnClient`, but a *member* is narrowed to their own patch:
 * rows for a client they are on, or rows they are personally assigned to.
 *
 * Admins and managers are unaffected. Use this for anything a member should see
 * a slice of; use `isStaffOrOwnClient` where every teammate needs the full list
 * (the team directory, for instance).
 */
export const isScopedStaffOrOwnClient =
  (field = 'client', assigneeField?: string): Access =>
  async ({ req }) => {
    const account = staffOf(req.user)

    if (account) {
      if (isWideStaff(account) || !account.id) return true

      const clientIds = await assignedClientIds(req, account.id)
      const or: Where[] = []
      if (clientIds.length > 0) or.push({ [field]: { in: clientIds } })
      if (assigneeField) or.push({ [assigneeField]: { contains: account.id } })

      // A member on nothing sees nothing — not everything, and not an error.
      if (or.length === 0) return MATCHES_NOTHING
      return { or }
    }

    const portal = clientOf(req.user)
    if (!portal) return false

    const clientId = clientIdOf(portal)
    if (!clientId) return MATCHES_NOTHING

    return { [field]: { equals: clientId } }
  }

/**
 * A client may withdraw a request they raised — but only while it is still open.
 *
 * Expressed as a query constraint rather than checked in the action, so a
 * hand-crafted DELETE cannot erase a decision that went against them. Staff are
 * unrestricted.
 */
export const canWithdrawRequest: Access = ({ req: { user } }) => {
  if (staffOf(user)) return true

  const account = clientOf(user)
  if (!account) return false

  const clientId = clientIdOf(account)
  if (!clientId) return false

  const and: Where[] = [{ client: { equals: clientId } }, { status: { in: ['new', 'review'] } }]
  return { and }
}

/** For the `clients` collection itself, where the row id *is* the client. */
export const isStaffOrSelfClient: Access = async ({ req }) => {
  const account = staffOf(req.user)

  if (account) {
    if (isWideStaff(account) || !account.id) return true
    const clientIds = await assignedClientIds(req, account.id)
    if (clientIds.length === 0) return MATCHES_NOTHING
    return { id: { in: clientIds } }
  }

  const portal = clientOf(req.user)
  if (!portal) return false

  const clientId = clientIdOf(portal)
  if (!clientId) return MATCHES_NOTHING

  return { id: { equals: clientId } }
}

/**
 * Tasks live under a project, so a member is scoped by project assignment
 * rather than by client. Clients never see the task breakdown at all.
 */
export const isScopedStaffTasks: Access = async ({ req }) => {
  const account = staffOf(req.user)
  if (!account) return false
  if (isWideStaff(account) || !account.id) return true

  const projects = await req.payload
    .find({
      collection: 'projects',
      where: { assignedTo: { contains: account.id } },
      limit: 500,
      depth: 0,
      pagination: false,
      overrideAccess: true,
    })
    .then((res) => res.docs.map((d) => d.id))
    .catch(() => [] as (string | number)[])

  if (projects.length === 0) return MATCHES_NOTHING
  return { project: { in: projects } }
}

// ── Self-service ─────────────────────────────────────────────────────────────

/**
 * Lets an account edit its own row without granting it anything else, so both
 * areas can have a profile page. Every field that decides what the account can
 * *see* — `client`, `approvalStatus`, `role`, `isPaused` — carries
 * `staffOnlyField`, so self-editing cannot become self-promotion.
 */
export const isStaffAdminOrSelf: Access = ({ req: { user } }) => {
  const account = staffOf(user)
  if (!account) return false
  if (account.role === 'admin') return true
  return account.id ? { id: { equals: account.id } } : false
}

export const isStaffOrSelfAccount: Access = ({ req: { user } }) => {
  if (staffOf(user)) return true
  const account = anyClientOf(user)
  if (!account?.id) return false
  return { id: { equals: account.id } }
}

/**
 * Notifications: you read and clear your own, whichever side you are on.
 *
 * The branches are annotated as `Where` rather than inferred — TypeScript
 * otherwise widens the union to include `clientRecipient?: undefined`, which
 * Payload's index-signature-based `Where` type rejects.
 */
export const isOwnNotification: Access = ({ req: { user } }) => {
  const staff = staffOf(user)
  if (staff?.id) return { staffRecipient: { equals: staff.id } } as Where

  const portal = anyClientOf(user)
  if (portal?.id) return { clientRecipient: { equals: portal.id } } as Where

  return false
}

/**
 * Field guard for anything a portal user must never set on themselves — above
 * all `client`, which decides whose data they can read.
 */
export const staffOnlyField: FieldAccess = ({ req: { user } }) => Boolean(staffOf(user))

/** Admin-only fields, e.g. a teammate's role. Stops self-promotion. */
export const staffAdminField: FieldAccess = ({ req: { user } }) => staffOf(user)?.role === 'admin'

/**
 * Hides a field from clients entirely — internal notes, margins, anything the
 * portal renders from the same document but must not show.
 */
export const notClientField: FieldAccess = ({ req: { user } }) =>
  (user as Account | null)?.collection !== CLIENT
