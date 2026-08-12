import type { Payload } from 'payload'

/**
 * Reconciles the primary CRM staff account with the environment on every boot.
 *
 * WHY THIS EXISTS. `crm-accounts` has `create: isStaffAdmin`, so only an
 * existing staff admin can mint a team login — and the collection is hidden
 * from /admin, where the CMS `users` account lives in a different collection
 * entirely and therefore fails that check too. On a fresh database that is a
 * closed loop: nobody can create the first staff account, and /crm is
 * unreachable forever. This is the way in.
 *
 * Mirrors `ensureAdminUser` deliberately — same variables pattern, same
 * semantics — so there is one thing to learn, not two:
 *  - Created if missing, password reset if it drifted.
 *  - Changing this password in the CRM is reverted on the next restart. Manage
 *    it through the environment, or promote a second admin for daily use and
 *    keep this one as the break-glass login.
 *  - Anyone who can read the environment can sign in. Same trust level as
 *    PAYLOAD_SECRET.
 *
 * Separate variables from ADMIN_EMAIL/ADMIN_PASSWORD on purpose: these are two
 * different collections with two different login pages, and sharing one
 * credential across them would undo the separation the split exists to create.
 *
 * A no-op when either variable is unset. Never throws.
 */
export const ensureStaffAdmin = async (payload: Payload): Promise<void> => {
  const rawEmail = process.env.CRM_ADMIN_EMAIL
  const rawPassword = process.env.CRM_ADMIN_PASSWORD

  const email = rawEmail?.trim()
  // Trimmed for the same reason as the CMS admin: deployment UIs routinely
  // leave a trailing space, and "secret " failing when you type "secret" gives
  // no clue as to why.
  const password = rawPassword?.trim()

  if (!email || !password) {
    if (rawEmail || rawPassword) {
      payload.logger.warn(
        'CRM_ADMIN_EMAIL and CRM_ADMIN_PASSWORD must both be set to manage the primary CRM admin; skipping.',
      )
    }
    return
  }

  if (rawPassword !== password || rawEmail !== email) {
    payload.logger.warn(
      'CRM_ADMIN_EMAIL/CRM_ADMIN_PASSWORD had surrounding whitespace, which has been trimmed. ' +
        'Sign in with the trimmed value.',
    )
  }

  try {
    const existing = await payload.find({
      collection: 'crm-accounts',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const current = existing.docs[0]

    if (current) {
      await payload.update({
        collection: 'crm-accounts',
        id: current.id,
        // Role and pause are forced too: this is the recovery login, so it must
        // still work after someone has demoted or suspended it.
        data: { password, role: 'admin', isPaused: false, isEnvManaged: true },
        overrideAccess: true,
      })
      payload.logger.info(`Primary CRM admin "${email}" reconciled from environment.`)
      return
    }

    await payload.create({
      collection: 'crm-accounts',
      data: {
        email,
        password,
        name: process.env.CRM_ADMIN_NAME?.trim() || 'Administrator',
        role: 'admin',
        isEnvManaged: true,
      },
      overrideAccess: true,
    })
    payload.logger.info(`Primary CRM admin "${email}" created from environment.`)
  } catch (err) {
    // Log loudly but keep booting — the marketing site must not go down because
    // the CRM admin could not be reconciled.
    payload.logger.error(
      `Could not reconcile primary CRM admin "${email}": ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}
