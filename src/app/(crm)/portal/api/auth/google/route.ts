import { startGoogleFlow } from '@/crm/google'

/** Client Google sign-in — begins the OAuth redirect. */
export async function GET(req: Request) {
  return startGoogleFlow(req, '/portal/api/auth/google')
}
