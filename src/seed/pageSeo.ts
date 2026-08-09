/**
 * Manual page-seo seed — run with: pnpm seed:seo
 *
 * Normally unnecessary: the same routine runs from Payload's onInit, so a deploy
 * creates any missing records on its own (see src/utilities/ensurePageSeo.ts).
 * This exists for running it on demand against an environment without waiting
 * for a restart.
 *
 * Existing records are never overwritten.
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ensurePageSeo } from '@/utilities/ensurePageSeo'
import { pageSeoSeed } from './pageSeoManifest'

// Top-level await, not a floating promise: the runner finishes once the module
// has evaluated, so `ensurePageSeo(...)` alone would exit before writing.
try {
  const payload = await getPayload({ config: configPromise })
  await ensurePageSeo(payload)
  payload.logger.info(`page-seo: manifest holds ${pageSeoSeed.length} pages.`)
  process.exit(0)
} catch (err) {
  console.error('page-seo seed failed:', err)
  process.exit(1)
}
