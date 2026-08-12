import { handleGoogleCallback } from '@/crm/google'

/**
 * Client callback. Self-registration is allowed, but `createNewCompany` means a
 * new signup always gets its own `clients` record — it can never join an
 * existing company and read that company's invoices.
 */
export async function GET(req: Request) {
  return handleGoogleCallback(req, '/portal/api/auth/google', {
    collection: 'client-accounts',
    onMissing: 'createNewCompany',
    successPath: '/portal',
    failurePath: '/portal/login',
  })
}
