import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

// From cacheTags, not getWebsiteShowcase: that module pulls in the Payload
// config, which is what imports this collection in the first place.
import { WEBSITE_SHOWCASE_TAG } from '@/utilities/cacheTags'

/**
 * The homepage caches this list for an hour; a save should show up now.
 *
 * Guarded exactly like the Posts and SiteSettings hooks: `revalidateTag` only
 * works inside a Next request and throws anywhere else. That matters more here
 * than elsewhere — `scripts/capture-showcase-shots.ts` writes to this
 * collection from the Local API on every capture, so an unguarded call would
 * fail the whole script.
 *
 * `revalidatePath('/')` alongside the tag is the same belt-and-braces the Posts
 * hook uses: the tag is what actually invalidates the `force-static` homepage,
 * the path call is there in case the tag plumbing changes under us.
 */
const bust = (payload: { logger: { info: (msg: string) => void } }) => {
  try {
    revalidateTag(WEBSITE_SHOWCASE_TAG, 'max')
    revalidatePath('/', 'page')
  } catch {
    payload.logger.info('website-showcase saved outside a request; cache will expire normally.')
  }
}

export const revalidateShowcase: CollectionAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context?.disableRevalidate) bust(payload)
  return doc
}

export const revalidateShowcaseDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context?.disableRevalidate) bust(payload)
  return doc
}
