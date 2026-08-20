/**
 * Cache tag names, in a module that imports nothing.
 *
 * Deliberately separate from the fetchers that use them. A collection hook needs
 * the tag, and the fetcher needs `@payload-config` — so a tag exported from the
 * fetcher makes the collection import the config that is, at that moment, still
 * building the collection. That cycle resolves to undefined at hook time.
 */

export const WEBSITE_SHOWCASE_TAG = 'website-showcase'
export const TESTIMONIALS_TAG = 'testimonials'
