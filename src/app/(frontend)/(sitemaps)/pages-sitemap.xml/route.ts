import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import siteConfig from '@/config/site'

const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  siteConfig.url

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const dateFallback = new Date().toISOString()

    // Query page-seo records for accurate lastmod dates
    const seoRecords = await payload.find({
      collection: 'page-seo',
      overrideAccess: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      select: { pageSlug: true, updatedAt: true },
    })

    const lastmodBySlug: Record<string, string> = {}
    for (const doc of seoRecords.docs) {
      if (doc.pageSlug) lastmodBySlug[doc.pageSlug] = doc.updatedAt || dateFallback
    }

    type Changefreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

    const hardcodedPages: { slug: string; loc: string; priority: number; changefreq: Changefreq }[] = [
      { slug: 'home', loc: `${SITE_URL}/`, priority: 1.0, changefreq: 'weekly' },
      { slug: 'services', loc: `${SITE_URL}/services`, priority: 0.9, changefreq: 'monthly' },
      { slug: 'about', loc: `${SITE_URL}/about`, priority: 0.8, changefreq: 'monthly' },
      { slug: 'blog', loc: `${SITE_URL}/blog`, priority: 0.8, changefreq: 'daily' },
      { slug: 'careers', loc: `${SITE_URL}/careers`, priority: 0.6, changefreq: 'monthly' },
      { slug: 'contact', loc: `${SITE_URL}/contact`, priority: 0.7, changefreq: 'yearly' },
      { slug: 'search', loc: `${SITE_URL}/search`, priority: 0.3, changefreq: 'weekly' },
    ]

    return hardcodedPages.map(({ slug, loc, priority, changefreq }) => ({
      loc,
      lastmod: lastmodBySlug[slug] ?? dateFallback,
      priority,
      changefreq,
    }))
  },
  ['pages-sitemap'],
  { tags: ['pages-sitemap'] },
)

export async function GET() {
  const sitemap = await getPagesSitemap()
  return getServerSideSitemap(sitemap)
}
