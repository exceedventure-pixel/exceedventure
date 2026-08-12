import type { AccessArgs } from 'payload'

import type { User } from '@/payload-types'

type isAuthenticated = (args: AccessArgs<User>) => boolean

/**
 * A signed-in **CMS** account.
 *
 * The collection is checked, not merely that somebody is signed in. This used
 * to be `Boolean(user)`, which is true for a CRM teammate or a client-portal
 * visitor as well — nothing exploits that today, because those two areas carry
 * their own cookies and Payload's REST layer never sees them, but content
 * permissions should not rest on "there is currently no path to it".
 */
export const authenticated: isAuthenticated = ({ req: { user } }) =>
  (user as { collection?: string } | null)?.collection === 'users'
