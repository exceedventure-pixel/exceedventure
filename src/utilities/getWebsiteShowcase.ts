import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import configPromise from '@payload-config'

import type { ShowcaseItem } from '@/components/WebsiteShowcase/types'
import { WEBSITE_SHOWCASE_TAG } from './cacheTags'
import { getMediaUrl } from './getMediaUrl'
import { getServerSideURL } from './getURL'

export { WEBSITE_SHOWCASE_TAG }

/**
 * The published website showcase, as the homepage needs it.
 *
 * Cached like `getSiteSettings`: this is a handful of rows that change a few
 * times a year, rendered on the busiest page on the site. The tag lets a CMS
 * save clear it immediately (see the collection's afterChange hook).
 *
 * Never throws. The homepage must not be able to go down because a marketing
 * table is unreachable — an empty list simply hides the section.
 */

const CATEGORY_LABELS: Record<string, string> = {
  website: 'Website',
  webApp: 'Web App',
  ecommerce: 'E-commerce',
  landing: 'Landing Page',
  content: 'Content Platform',
  other: 'Project',
}

const load = unstable_cache(
  async (): Promise<ShowcaseItem[]> => {
    try {
      const payload = await getPayload({ config: configPromise })

      const { docs } = await payload.find({
        collection: 'website-showcase',
        // A site with no screenshot yet would render as an empty grey box, so it
        // is filtered out here rather than handled in the card. Adding a URL in
        // /admin and capturing it later is the normal flow, not an error.
        where: {
          and: [{ published: { equals: true } }, { poster: { exists: true } }],
        },
        sort: ['-featured', 'sortOrder', 'createdAt'],
        depth: 1,
        limit: 12,
        pagination: false,
      })

      const ownOrigin = safeOrigin(getServerSideURL())

      return docs.map((doc) => toItem(doc, ownOrigin)).filter((item): item is ShowcaseItem => !!item)
    } catch {
      return []
    }
  },
  ['website-showcase'],
  { tags: [WEBSITE_SHOWCASE_TAG], revalidate: 3600 },
)

export const getWebsiteShowcase = (): Promise<ShowcaseItem[]> => load()

const safeOrigin = (value: string): string | null => {
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

/** Payload's generated types are wide here; narrow to what the card actually reads. */
type ShowcaseDoc = {
  id: number
  title?: string | null
  url?: string | null
  displayUrl?: string | null
  category?: string | null
  poster?: { url?: string | null; updatedAt?: string | null } | number | null
  embed?: {
    mode?: string | null
    status?: string | null
    viewportHeight?: number | null
    pageHeight?: number | null
  } | null
}

const toItem = (doc: ShowcaseDoc, ownOrigin: string | null): ShowcaseItem | null => {
  const url = doc.url?.trim()
  const poster = typeof doc.poster === 'object' ? doc.poster : null
  const posterUrl = getMediaUrl(poster?.url, poster?.updatedAt)

  // `depth: 1` should have populated the upload, and the query already filtered
  // to rows that have one — but a media doc deleted out from under us would
  // arrive as a bare id, and a card with no poster has nothing to show.
  if (!url || !posterUrl) return null

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  const mode = doc.embed?.mode ?? 'auto'
  /**
   * Never frame ourselves. `allow-same-origin` on a cross-origin frame is safe
   * — it restores the *embedded* site's origin, not ours — but on a same-origin
   * frame the embedded document could reach out and strip its own sandbox
   * attribute, which turns this card into a self-XSS vector. Subdomains are
   * separate origins, so the existing venture sites are unaffected.
   */
  const sameOrigin = ownOrigin !== null && parsed.origin === ownOrigin
  const canEmbed =
    !sameOrigin && (mode === 'live' || (mode === 'auto' && doc.embed?.status === 'allowed'))

  return {
    id: doc.id,
    title: doc.title?.trim() || parsed.hostname,
    url,
    host: parsed.hostname,
    displayUrl: doc.displayUrl?.trim() || parsed.hostname.replace(/^www\./, ''),
    category: doc.category ? (CATEGORY_LABELS[doc.category] ?? null) : null,
    posterUrl,
    posterHeight: doc.embed?.pageHeight || 2600,
    canEmbed,
    viewportHeight: doc.embed?.viewportHeight || 2600,
  }
}
