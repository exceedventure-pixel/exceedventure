import type { Metadata } from 'next'
import React from 'react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { jsonLdScript, webPageSchema, breadcrumbSchema } from '@/utilities/jsonld'
import siteConfig from '@/config/site'
import HomeClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('home').catch(() => null)
  return generatePageMeta({ slug: '/', seoDoc, fallbackTitle: siteConfig.seo.defaultTitle })
}

export default async function HomePage() {
  const seoDoc = await getPageSEO('home').catch(() => null)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageSchema({
              name: seoDoc?.meta?.title ?? siteConfig.seo.defaultTitle,
              description: seoDoc?.meta?.description ?? siteConfig.seo.defaultDescription,
              url: siteConfig.url,
            }),
            breadcrumbSchema([{ name: 'Home', href: '/' }]),
          ]),
        }}
      />

      <HomeClient />
    </>
  )
}
