import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

// From cacheTags, not getTestimonials: that module pulls in the Payload config,
// which is what imports this collection in the first place.
import { TESTIMONIALS_TAG } from '@/utilities/cacheTags'

/**
 * The homepage caches reviews for an hour; a save should show up now.
 *
 * Guarded the same way as the showcase hook: `revalidateTag` only works inside
 * a Next request and throws anywhere else, and this collection is writable from
 * the Local API (a seed script, an import) where there is no request at all.
 */
const bust = (payload: { logger: { info: (msg: string) => void } }) => {
  try {
    revalidateTag(TESTIMONIALS_TAG, 'max')
    revalidatePath('/', 'page')
  } catch {
    payload.logger.info('testimonial saved outside a request; cache will expire normally.')
  }
}

export const revalidateTestimonial: CollectionAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context?.disableRevalidate) bust(payload)
  return doc
}

export const revalidateTestimonialDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context?.disableRevalidate) bust(payload)
  return doc
}
