import { startGoogleFlow } from '@/crm/google'

/** Staff Google sign-in — begins the OAuth redirect. */
export async function GET(req: Request) {
  return startGoogleFlow(req, '/crm/api/auth/google')
}
