import type { MetadataRoute } from 'next'
import siteConfig from '@/config/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/next/'],
      },
    ],
    sitemap: [
      `${siteConfig.url}/pages-sitemap.xml`,
      `${siteConfig.url}/posts-sitemap.xml`,
    ],
  }
}
