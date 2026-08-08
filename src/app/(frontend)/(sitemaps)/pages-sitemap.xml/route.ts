import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import siteConfig from '@/config/site'

const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || siteConfig.url

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
    type Entry = { slug: string; priority: number; changefreq: Changefreq }

    /**
     * Service URLs are derived from siteConfig.nav rather than listed by hand,
     * so every level lands in the sitemap automatically. This matters because
     * the header menus deliberately stop at level two — third-level pages are
     * reachable for people via their parent's card grid, and for crawlers only
     * through here. Deriving them means a page can never be published to the
     * nav config and silently left out of the sitemap.
     */
    const serviceEntries: Entry[] = siteConfig.nav
      .filter((item) => item.children?.length)
      .flatMap((section) => [
        { slug: section.href.replace(/^\//, ''), priority: 0.9, changefreq: 'monthly' as const },
        ...(section.children ?? []).flatMap((child) => [
          { slug: child.href.replace(/^\//, ''), priority: 0.8, changefreq: 'monthly' as const },
          ...(child.children ?? []).map((sub) => ({
            slug: sub.href.replace(/^\//, ''),
            priority: 0.7,
            changefreq: 'monthly' as const,
          })),
        ]),
      ])

    const staticEntries: Entry[] = [
      { slug: 'home', priority: 1.0, changefreq: 'weekly' },
      { slug: 'about', priority: 0.8, changefreq: 'monthly' },
      { slug: 'blog', priority: 0.8, changefreq: 'daily' },
      { slug: 'our-works', priority: 0.7, changefreq: 'monthly' },
      { slug: 'pricing', priority: 0.7, changefreq: 'monthly' },
      { slug: 'careers', priority: 0.6, changefreq: 'monthly' },
      { slug: 'contact', priority: 0.7, changefreq: 'yearly' },
      { slug: 'search', priority: 0.3, changefreq: 'weekly' },
    ]

    // Dedupe defensively: a slug reachable two ways must still appear once.
    const seen = new Set<string>()
    return [...staticEntries, ...serviceEntries]
      .filter(({ slug }) => (seen.has(slug) ? false : seen.add(slug)))
      .map(({ slug, priority, changefreq }) => ({
        loc: slug === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${slug}`,
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
