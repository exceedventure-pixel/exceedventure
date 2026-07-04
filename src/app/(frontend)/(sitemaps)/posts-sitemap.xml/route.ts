import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import siteConfig from '@/config/site'

const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  siteConfig.url

const getPostsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const dateFallback = new Date().toISOString()

    const results = await payload.find({
      collection: 'posts',
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: { _status: { equals: 'published' } },
      select: { slug: true, updatedAt: true },
    })

    return results.docs
      .filter((post) => Boolean(post?.slug))
      .map((post) => ({
        loc: `${SITE_URL}/blog/${post.slug}`,
        lastmod: post.updatedAt || dateFallback,
        priority: 0.7,
        changefreq: 'weekly' as const,
      }))
  },
  ['posts-sitemap'],
  { tags: ['posts-sitemap'] },
)

export async function GET() {
  const sitemap = await getPostsSitemap()
  return getServerSideSitemap(sitemap)
}
