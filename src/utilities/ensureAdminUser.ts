import type { Payload } from 'payload'

/**
 * Reconciles the primary admin account with the environment on every boot.
 *
 * Set ADMIN_EMAIL and ADMIN_PASSWORD and that account is guaranteed to exist
 * and to have that password — created if missing, password reset if it drifted.
 * This is the recovery path when nobody holds working credentials, and it makes
 * the environment the single source of truth for the primary admin.
 *
 * Deliberate consequences, both of which matter operationally:
 *  - Changing this account's password in the admin UI is reverted on the next
 *    restart. Manage it through the environment, or create a second account for
 *    day-to-day use and leave this one as the break-glass login.
 *  - Anyone who can read the environment can sign in as an admin. That is the
 *    same trust level as PAYLOAD_SECRET and DATABASE_URL, but worth stating.
 *
 * A no-op when either variable is unset, so local development is untouched.
 * Never throws — a failure here must not take the whole app down.
 */
export const ensureAdminUser = async (payload: Payload): Promise<void> => {
  const rawEmail = process.env.ADMIN_EMAIL
  const rawPassword = process.env.ADMIN_PASSWORD

  const email = rawEmail?.trim()
  // Trimmed deliberately. Deployment UIs and .env files routinely leave a
  // trailing space, and a password stored as "secret " while you type "secret"
  // fails with no clue as to why. Warn so the surprise is visible either way.
  const password = rawPassword?.trim()

  if (!email || !password) {
    // Only one set is almost always a misconfiguration worth surfacing.
    if (rawEmail || rawPassword) {
      payload.logger.warn(
        'ADMIN_EMAIL and ADMIN_PASSWORD must both be set to manage the primary admin; skipping.',
      )
    }
    return
  }

  if (rawPassword !== password || rawEmail !== email) {
    payload.logger.warn(
      'ADMIN_EMAIL/ADMIN_PASSWORD had surrounding whitespace, which has been trimmed. ' +
        'Sign in with the trimmed value.',
    )
  }

  try {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const current = existing.docs[0]

    if (current) {
      await payload.update({
        collection: 'users',
        id: current.id,
        data: { password },
        overrideAccess: true,
      })
      payload.logger.info(`Primary admin "${email}" reconciled from environment.`)
      return
    }

    await payload.create({
      collection: 'users',
      data: { email, password, name: process.env.ADMIN_NAME?.trim() || 'Administrator' },
      overrideAccess: true,
    })
    payload.logger.info(`Primary admin "${email}" created from environment.`)
  } catch (err) {
    // Log loudly but keep booting — an unreachable DB here would otherwise take
    // the entire site down, not just the admin.
    payload.logger.error(
      `Could not reconcile primary admin "${email}": ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}
