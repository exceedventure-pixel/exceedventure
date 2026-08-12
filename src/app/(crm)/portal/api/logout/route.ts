import { clearedSessionCookie, cookieNameFor } from '@/crm/session'

/**
 * Sign out of the client dashboard, and only that.
 *
 * Expires this area's cookie alone — the CMS session and the other area's
 * session are untouched. Payload's own logout endpoint clears the shared
 * `payload-token`, which is what made signing out of one area appear to break
 * the others.
 */
export async function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearedSessionCookie(cookieNameFor('client-accounts')),
    },
  })
}
