import type { Metadata } from 'next'
import React from 'react'
import { Car, Search, Users } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("digital-marketing/niche-marketing/automotive-marketing-agency").catch(() => null)
  return generatePageMeta({
    slug: "digital-marketing/niche-marketing/automotive-marketing-agency",
    seoDoc,
    fallbackTitle: "Automotive Marketing Agency",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        slug="digital-marketing/niche-marketing/automotive-marketing-agency"
        color="blue"
        icon={Car}
        badge="Specialist Service"
        titleLead="Automotive Marketing "
        titleAccent="Agency"
        subtitle="Marketing for dealers, garages and automotive service businesses."
        sections={[
          {
            color: "blue",
            title: 'What this service covers',
            subtitle: "Marketing for dealers, garages and automotive service businesses.",
            features: [
              {
                title: "Stock & Offer Promotion",
                icon: Car,
                desc: "Vehicles and offers put in front of nearby buyers.",
              },
              {
                title: "Local Search",
                icon: Search,
                desc: "Found first for the services people search in your area.",
              },
              {
                title: "Lead Handling",
                icon: Users,
                desc: "Enquiries captured and routed before they go cold.",
              },
            ],
          },
        ]}
      />
  )
}
