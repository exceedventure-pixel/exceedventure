import type { Metadata } from 'next'
import React from 'react'
import { Code2, Gauge, Plug } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("websites-softwares/e-commerce/ecommerce-web-developers").catch(() => null)
  return generatePageMeta({
    slug: "websites-softwares/e-commerce/ecommerce-web-developers",
    seoDoc,
    fallbackTitle: "Ecommerce Web Developers",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        color="teal"
        icon={Code2}
        badge="Specialist Service"
        titleLead="Ecommerce Web "
        titleAccent="Developers"
        subtitle="Developers who build storefronts that stay fast under real traffic."
        sections={[
          {
            color: "teal",
            title: 'What this service covers',
            subtitle: "Developers who build storefronts that stay fast under real traffic.",
            features: [
              {
                title: "Custom Build",
                icon: Code2,
                desc: "A store built to your catalogue rather than forced into a template.",
              },
              {
                title: "Performance",
                icon: Gauge,
                desc: "Speed treated as a feature, because it decides whether people buy.",
              },
              {
                title: "Integrations",
                icon: Plug,
                desc: "Stock, shipping and finance systems connected to the store.",
              },
            ],
          },
        ]}
      />
  )
}
