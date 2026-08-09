/**
 * Regenerates src/seed/pageSeoManifest.ts by scanning every page for its
 * `getPageSEO('…')` call.
 *
 * Wired into `prebuild`, so any page added to the codebase is in the manifest by
 * the time the image is built, and Payload's onInit creates its CMS record on
 * the next boot. That makes "add a page" a one-step operation — without this the
 * manifest would silently go stale and new pages would have no editable SEO.
 *
 * Slugs come from the page's own getPageSEO call rather than from the folder
 * path, so they cannot drift from what the page actually queries.
 *
 * Run directly with: pnpm generate:seo-manifest
 */

import fs from 'node:fs'
import path from 'node:path'

const APP = path.join('src', 'app', '(frontend)')
const OUT = path.join('src', 'seed', 'pageSeoManifest.ts')

const rows = []

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full)
      continue
    }
    if (entry.name !== 'page.tsx') continue
    // Dynamic segments ([slug]) are driven by their own collections, not page-seo.
    if (full.includes('[')) continue

    const src = fs.readFileSync(full, 'utf8')
    const slug = src.match(/getPageSEO\(\s*['"]([^'"]+)['"]\s*\)/)
    if (!slug) continue

    const title = src.match(/fallbackTitle:\s*['"]([^'"]+)['"]/)
    // ServiceDetail / PageHero subtitles are real one-line summaries, which make
    // far better starting meta descriptions than a blank field.
    const subtitle =
      src.match(/subtitle=\{?["']([^"'{}]{20,300})["']\}?/) ||
      src.match(/subtitle:\s*\n?\s*['"]([^'"]{20,300})['"]/)

    rows.push({
      slug: slug[1],
      title: title ? title[1] : '',
      description: subtitle ? subtitle[1].replace(/\s+/g, ' ').trim() : '',
    })
  }
}

walk(APP)

const seen = new Set()
const unique = rows
  .filter((r) => (seen.has(r.slug) ? false : seen.add(r.slug)))
  .sort((a, b) => a.slug.localeCompare(b.slug))

const body = unique
  .map(
    (r) =>
      `  {\n    pageSlug: ${JSON.stringify(r.slug)},\n` +
      `    title: ${JSON.stringify(r.title)},\n` +
      `    description: ${JSON.stringify(r.description)},\n  },`,
  )
  .join('\n')

const file = `/**
 * Every hardcoded page that reads its SEO from the CMS.
 *
 * GENERATED FILE — do not edit by hand.
 * Regenerate with: pnpm generate:seo-manifest (also runs automatically on build)
 *
 * Slugs are taken from each page's own \`getPageSEO('…')\` call, so they always
 * match what the page looks up. Titles and descriptions here are only the
 * starting values used when a record is first created; once a record exists,
 * nothing in this file can overwrite what you edit in the admin.
 */

export type PageSeoSeed = {
  pageSlug: string
  title: string
  description: string
}

export const pageSeoSeed: PageSeoSeed[] = [
${body}
]
`

const previous = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : ''
fs.writeFileSync(OUT, file)

// Match only entries (pageSlug: "…"), not the `pageSlug: string` in the type.
const previousCount = (previous.match(/pageSlug: "/g) || []).length
const delta = unique.length - previousCount
console.log(
  `page-seo manifest: ${unique.length} pages` +
    (delta === 0 ? ' (unchanged)' : delta > 0 ? ` (+${delta} new)` : ` (${delta} removed)`),
)
