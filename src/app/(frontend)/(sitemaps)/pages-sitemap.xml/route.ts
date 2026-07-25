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
      { slug: 'solutions', loc: `${SITE_URL}/solutions`, priority: 0.9, changefreq: 'monthly' },
      { slug: 'solutions/websites-apps', loc: `${SITE_URL}/solutions/websites-apps`, priority: 0.8, changefreq: 'monthly' },
      { slug: 'solutions/automation', loc: `${SITE_URL}/solutions/automation`, priority: 0.8, changefreq: 'monthly' },
      { slug: 'solutions/media-buying', loc: `${SITE_URL}/solutions/media-buying`, priority: 0.8, changefreq: 'monthly' },
      { slug: 'solutions/web-growth-seo', loc: `${SITE_URL}/solutions/web-growth-seo`, priority: 0.8, changefreq: 'monthly' },
      { slug: 'solutions/branding', loc: `${SITE_URL}/solutions/branding`, priority: 0.8, changefreq: 'monthly' },
      { slug: 'solutions/marketing', loc: `${SITE_URL}/solutions/marketing`, priority: 0.8, changefreq: 'monthly' },
      { slug: 'solutions/content-supply', loc: `${SITE_URL}/solutions/content-supply`, priority: 0.8, changefreq: 'monthly' },
      { slug: 'solutions/smm-va', loc: `${SITE_URL}/solutions/smm-va`, priority: 0.8, changefreq: 'monthly' },
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
