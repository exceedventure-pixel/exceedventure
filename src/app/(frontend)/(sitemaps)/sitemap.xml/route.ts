import siteConfig from '@/config/site'

/**
 * Sitemap index at /sitemap.xml — the URL crawlers and Search Console try first.
 *
 * Previously this 404'd in production. next-sitemap wrote public/sitemap.xml
 * during postbuild, but that path is gitignored and the Dockerfile copies
 * `public` from the build context rather than the builder stage, so the file
 * never reached the image — and the generated index was empty anyway, because
 * the next-sitemap config excludes '/*'. Serving it from a route removes all
 * three failure modes.
 *
 * Built from the same SITE_URL logic as the child sitemap routes so the three
 * always agree on the host.
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  siteConfig.url

const CHILD_SITEMAPS = ['pages-sitemap.xml', 'posts-sitemap.xml']

export async function GET() {
  const lastmod = new Date().toISOString()

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${CHILD_SITEMAPS.map(
  (name) => `  <sitemap>
    <loc>${SITE_URL}/${name}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`,
).join('\n')}
</sitemapindex>
`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate',
    },
  })
}
