import { getPayload } from 'payload'
import { cache } from 'react'
import configPromise from '@payload-config'

export const getPageSEO = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'page-seo',
    where: { pageSlug: { equals: slug } },
    limit: 1,
    overrideAccess: false,
    depth: 1,
  })

  return result.docs?.[0] ?? null
})
