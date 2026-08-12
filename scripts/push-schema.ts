/**
 * Boots Payload once so the postgres adapter pushes the current config to
 * whatever DATABASE_URL points at.
 *
 * Used against a throwaway database to capture the schema a code change
 * produces, which is then hand-written into a migration — `payload
 * migrate:create` does not run in this environment (see the note at the top of
 * src/migrations/20260809_154317_crm_collections.ts).
 *
 *   DATABASE_URL=…/schemagen node --env-file=.env --import tsx scripts/push-schema.ts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config'

const run = async () => {
  const payload = await getPayload({ config })
  await payload.db.destroy?.()
  process.exit(0)
}

void run()
