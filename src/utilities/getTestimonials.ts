import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import configPromise from '@payload-config'

import type { Testimonial } from '@/components/Testimonials/types'
import { TESTIMONIALS_TAG } from './cacheTags'
import { getMediaUrl } from './getMediaUrl'

export { TESTIMONIALS_TAG }

/**
 * Published client reviews, as the homepage needs them.
 *
 * Cached like `getWebsiteShowcase`: a handful of rows that change a few times a
 * year, rendered on the busiest page on the site. The tag lets a CMS save clear
 * it immediately (see the collection's afterChange hook).
 *
 * Never throws. The homepage must not be able to go down because a marketing
 * table is unreachable — an empty list falls back to the placeholder reviews.
 */

/** Four columns of three. Fewer than one full column each and the strip looks broken. */
export const MIN_TESTIMONIALS = 4

/** Enough to fill four columns generously without a long query. */
const LIMIT = 24

/**
 * "Briana Patton" → "BP", "Cher" → "C".
 *
 * Computed here rather than in the card so the DTO stays the whole story and
 * the client never has to re-derive anything it was handed.
 */
const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?'

const toTestimonial = (doc: Record<string, unknown>): Testimonial | null => {
  const quote = typeof doc.quote === 'string' ? doc.quote.trim() : ''
  const name = typeof doc.name === 'string' ? doc.name.trim() : ''
  if (!quote || !name) return null

  const role = typeof doc.role === 'string' && doc.role.trim() ? doc.role.trim() : null

  // The CMS constrains this to 1–5, but a row predating that constraint — or
  // written straight through the Local API — must not be able to render eleven
  // stars, so it is clamped rather than trusted.
  const raw = typeof doc.rating === 'number' ? Math.round(doc.rating) : 5
  const rating = Math.min(5, Math.max(1, raw))

  const avatar = doc.avatar
  const avatarUrl =
    avatar && typeof avatar === 'object' && 'url' in avatar
      ? getMediaUrl(
          (avatar as { url?: string | null }).url,
          (avatar as { updatedAt?: string | null }).updatedAt,
        ) || null
      : null

  return {
    id: String(doc.id),
    quote,
    name,
    role,
    rating,
    avatarUrl,
    initials: initialsOf(name),
  }
}

const load = unstable_cache(
  async (): Promise<Testimonial[]> => {
    try {
      const payload = await getPayload({ config: configPromise })

      const { docs } = await payload.find({
        collection: 'testimonials',
        where: { published: { equals: true } },
        sort: ['sortOrder', '-createdAt'],
        // 1, not 2: the avatar upload is one level down and nothing below it is
        // read, so a deeper query would fetch documents this page never uses.
        depth: 1,
        limit: LIMIT,
        pagination: false,
      })

      return docs
        .map((doc) => toTestimonial(doc as unknown as Record<string, unknown>))
        .filter((item): item is Testimonial => !!item)
    } catch {
      return []
    }
  },
  ['testimonials'],
  { tags: [TESTIMONIALS_TAG], revalidate: 3600 },
)

/**
 * Returns the CMS reviews, or an empty array when there are too few to fill the
 * strip. The section itself decides what to do with that — see its
 * `PLACEHOLDER_TESTIMONIALS`.
 */
export const getTestimonials = async (): Promise<Testimonial[]> => {
  const items = await load()
  return items.length >= MIN_TESTIMONIALS ? items : []
}
