import type { Metadata } from 'next'
import React from 'react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { getWebsiteShowcase } from '@/utilities/getWebsiteShowcase'
import { getTestimonials } from '@/utilities/getTestimonials'
import { generatePageMeta } from '@/utilities/generateMeta'
import { jsonLdScript, webPageSchema, breadcrumbSchema } from '@/utilities/jsonld'
import siteConfig from '@/config/site'
import HomeClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('home').catch(() => null)
  // A bare title, not seo.defaultTitle — that already contains the brand, and
  // buildTitle appends the "%s | Exceed Venture" template, which produced
  // "Exceed Venture | Digital Agency | Exceed Venture". The CMS record for the
  // 'home' slug overrides this.
  return generatePageMeta({ slug: '/', seoDoc, fallbackTitle: 'Digital Agency' })
}

export default async function HomePage() {
  const [seoDoc, showcase, testimonials] = await Promise.all([
    getPageSEO('home').catch(() => null),
    getWebsiteShowcase(),
    getTestimonials(),
  ])

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

      <HomeClient showcase={showcase} testimonials={testimonials} />
    </>
  )
}
