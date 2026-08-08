import type { Metadata } from 'next'
import React from 'react'
import { Award, CreditCard, Store, TrendingUp } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("websites-softwares/e-commerce/ecommerce-website-design-uk").catch(() => null)
  return generatePageMeta({
    slug: "websites-softwares/e-commerce/ecommerce-website-design-uk",
    seoDoc,
    fallbackTitle: "Ecommerce Website Design UK",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        color="teal"
        icon={Store}
        badge="Specialist Service"
        titleLead="Ecommerce Website Design "
        titleAccent="UK"
        subtitle="Online stores designed for UK retailers, with the trust signals shoppers expect."
        sections={[
          {
            color: "teal",
            title: 'What this service covers',
            subtitle: "Online stores designed for UK retailers, with the trust signals shoppers expect.",
            features: [
              {
                title: "Conversion-Led Design",
                icon: TrendingUp,
                desc: "Layouts built around the path to checkout.",
              },
              {
                title: "UK Payments & Tax",
                icon: CreditCard,
                desc: "Gateways, VAT and delivery rules configured for the UK.",
              },
              {
                title: "Trust & Reviews",
                icon: Award,
                desc: "Review, returns and security signals where buyers look for them.",
              },
            ],
          },
        ]}
      />
  )
}
