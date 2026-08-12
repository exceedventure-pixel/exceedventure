import { handleGoogleCallback } from '@/crm/google'

/**
 * Staff callback. `onMissing: 'reject'` keeps team access invite-only — a Google
 * account with no existing crm-accounts record is refused, never created.
 */
export async function GET(req: Request) {
  return handleGoogleCallback(req, '/crm/api/auth/google', {
    collection: 'crm-accounts',
    onMissing: 'reject',
    successPath: '/crm',
    failurePath: '/crm/login',
    requireDomain: process.env.GOOGLE_STAFF_DOMAIN?.trim() || undefined,
  })
}
