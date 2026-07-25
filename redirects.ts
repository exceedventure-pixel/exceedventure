import type { NextConfig } from 'next'

export const redirects: NextConfig['redirects'] = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header' as const,
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  // "Services" was renamed to "Solutions"; keep old URLs alive for SEO and any
  // external links. Paths whose slug also changed must be listed before the
  // generic /services/:slug* catch-all, or they'd resolve to a dead slug.
  const solutionsRedirects = [
    // Slug renames (old /services/* -> new /solutions/* slug)
    { source: '/services/websites-web-systems', destination: '/solutions/websites-apps', permanent: true },
    { source: '/services/automation-ai', destination: '/solutions/automation', permanent: true },
    { source: '/services/media-buying-seo', destination: '/solutions/media-buying', permanent: true },
    { source: '/services/creative-assets-branding', destination: '/solutions/branding', permanent: true },
    // Slugs that were renamed after the /solutions launch
    { source: '/solutions/websites-web-systems', destination: '/solutions/websites-apps', permanent: true },
    { source: '/solutions/automation-ai', destination: '/solutions/automation', permanent: true },
    { source: '/solutions/creative-assets-branding', destination: '/solutions/branding', permanent: true },
    // Generic Services -> Solutions
    { source: '/services', destination: '/solutions', permanent: true },
    { source: '/services/:slug*', destination: '/solutions/:slug*', permanent: true },
  ]

  return [internetExplorerRedirect, ...solutionsRedirects]
}
