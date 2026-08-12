import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { resolveAccount } from '@/crm/auth'

/**
 * "Is a client signed in?" for the public site header.
 *
 * Replaces `/api/client-accounts/me`, which reads Payload's shared cookie and
 * would answer for whichever area happened to write it last. This reads the
 * portal cookie specifically.
 */
export async function GET() {
  const payload = await getPayload({ config: configPromise })
  const user = await resolveAccount(payload, 'client-accounts')
  return Response.json({
    // `name` is included so the header and drawer can greet someone by name
    // rather than falling back to the front of their email address. Nothing
    // beyond these three is exposed — this is a public-site endpoint.
    user: user ? { id: user.id, email: user.email, name: user.name ?? null } : null,
  })
}
