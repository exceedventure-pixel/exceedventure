import type { Metadata } from 'next'
import React from 'react'
import { Facebook, Layers, LineChart, Target } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("digital-marketing/media-buying/facebook-advertising-agency").catch(() => null)
  return generatePageMeta({
    slug: "digital-marketing/media-buying/facebook-advertising-agency",
    seoDoc,
    fallbackTitle: "Facebook Advertising Agency",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        color="blue"
        icon={Facebook}
        badge="Specialist Service"
        titleLead="Facebook Advertising "
        titleAccent="Agency"
        subtitle="Facebook campaigns built around measurable return rather than vanity reach."
        sections={[
          {
            color: "blue",
            title: 'What this service covers',
            subtitle: "Facebook campaigns built around measurable return rather than vanity reach.",
            features: [
              {
                title: "Campaign Strategy",
                icon: Target,
                desc: "Structure and audiences planned before a penny is spent.",
              },
              {
                title: "Creative Testing",
                icon: Layers,
                desc: "Enough variants in play to find what actually works.",
              },
              {
                title: "Return Tracking",
                icon: LineChart,
                desc: "Tracking that ties spend to revenue, not impressions.",
              },
            ],
          },
        ]}
      />
  )
}
