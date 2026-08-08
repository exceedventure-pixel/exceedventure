import type { Metadata } from 'next'
import React from 'react'
import { Palette, PenTool, Smartphone, Store } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("websites-softwares/shopify/shopify-web-design").catch(() => null)
  return generatePageMeta({
    slug: "websites-softwares/shopify/shopify-web-design",
    seoDoc,
    fallbackTitle: "Shopify Web Design",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        color="teal"
        icon={Palette}
        badge="Specialist Service"
        titleLead="Shopify Web "
        titleAccent="Design"
        subtitle="Storefront design that reflects your brand and moves shoppers toward checkout."
        sections={[
          {
            color: "teal",
            title: 'What this service covers',
            subtitle: "Storefront design that reflects your brand and moves shoppers toward checkout.",
            features: [
              {
                title: "Custom Storefronts",
                icon: Store,
                desc: "A storefront that looks like you, not like everyone else.",
              },
              {
                title: "Brand-Led Layouts",
                icon: PenTool,
                desc: "Product and category pages designed around your range.",
              },
              {
                title: "Mobile-First Checkout",
                icon: Smartphone,
                desc: "Built for the phone, where most of your orders happen.",
              },
            ],
          },
        ]}
      />
  )
}
