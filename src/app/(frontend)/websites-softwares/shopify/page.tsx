import type { Metadata } from 'next'
import React from 'react'
import { Palette, Plug, ShoppingBag, TrendingUp } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'
import { SubServiceGrid } from '@/components/SubServiceGrid'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("websites-softwares/shopify").catch(() => null)
  return generatePageMeta({
    slug: "websites-softwares/shopify",
    seoDoc,
    fallbackTitle: "Shopify",
  })
}

export default function Page() {
  return (
    <>
      <ServiceDetail
        color="teal"
        icon={ShoppingBag}
        badge="Sub Service"
        titleLead=""
        titleAccent="Shopify"
        subtitle="Shopify storefronts designed, built and tuned for merchants who want to sell more."
        sections={[
          {
            color: "teal",
            title: 'What this service covers',
            subtitle: "Shopify storefronts designed, built and tuned for merchants who want to sell more.",
            features: [
              {
                title: "Theme Design",
                icon: Palette,
                desc: "Storefronts shaped around your brand rather than a stock theme.",
              },
              {
                title: "App & Integration Setup",
                icon: Plug,
                desc: "The apps you need wired in and configured properly.",
              },
              {
                title: "Conversion Tuning",
                icon: TrendingUp,
                desc: "Checkout and product pages refined against real behaviour.",
              },
            ],
          },
        ]}
      />
      <SubServiceGrid parentHref="/websites-softwares/shopify" />
    </>
  )
}
