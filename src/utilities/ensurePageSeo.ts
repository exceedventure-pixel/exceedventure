import type { Payload } from 'payload'
import { pageSeoSeed } from '@/seed/pageSeoManifest'

/**
 * Makes sure every hardcoded page has a `page-seo` record to edit in the admin.
 *
 * Runs from Payload's onInit, so a deploy that adds pages also adds their SEO
 * records — no one has to remember a seed command. Adding a page to
 * pageSeoManifest.ts is all it takes.
 *
 * Existing records are never touched: only missing slugs are created, so any
 * wording edited in the admin always survives a restart. Quiet when there is
 * nothing to do, so it doesn't add noise to every boot.
 *
 * Never throws — failing to seed metadata must not stop the site from starting.
 */
export const ensurePageSeo = async (payload: Payload): Promise<void> => {
  try {
    const existing = await payload.find({
      collection: 'page-seo',
      limit: 0,
      pagination: false,
      depth: 0,
      overrideAccess: true,
      select: { pageSlug: true },
    })

    const known = new Set(existing.docs.map((d) => d.pageSlug as string))
    const missing = pageSeoSeed.filter((entry) => !known.has(entry.pageSlug))

    if (missing.length === 0) return

    let created = 0
    for (const entry of missing) {
      try {
        await payload.create({
          collection: 'page-seo',
          data: {
            pageSlug: entry.pageSlug,
            meta: {
              title: entry.title || undefined,
              description: entry.description || undefined,
            },
          },
          overrideAccess: true,
        })
        created++
      } catch (err) {
        // One bad row must not abort the rest. A duplicate here is benign: two
        // server processes can boot at once and race on the same slug.
        payload.logger.warn(
          `page-seo: could not create "${entry.pageSlug}": ${err instanceof Error ? err.message : String(err)}`,
        )
      }
    }

    payload.logger.info(`page-seo: created ${created} missing record(s) of ${missing.length}.`)
  } catch (err) {
    payload.logger.error(
      `page-seo: seeding skipped — ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}
