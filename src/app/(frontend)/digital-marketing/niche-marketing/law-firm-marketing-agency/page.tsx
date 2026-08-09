import type { Metadata } from 'next'
import React from 'react'
import { LineChart, Scale, Search, ShieldCheck } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("digital-marketing/niche-marketing/law-firm-marketing-agency").catch(() => null)
  return generatePageMeta({
    slug: "digital-marketing/niche-marketing/law-firm-marketing-agency",
    seoDoc,
    fallbackTitle: "Law Firm Marketing Agency",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        slug="digital-marketing/niche-marketing/law-firm-marketing-agency"
        color="blue"
        icon={Scale}
        badge="Specialist Service"
        titleLead="Law Firm Marketing "
        titleAccent="Agency"
        subtitle="Compliant marketing for firms competing on high-value search terms."
        sections={[
          {
            color: "blue",
            title: 'What this service covers',
            subtitle: "Compliant marketing for firms competing on high-value search terms.",
            features: [
              {
                title: "High-Intent Search",
                icon: Search,
                desc: "Visibility for the searches that precede an instruction.",
              },
              {
                title: "Compliance-Aware Copy",
                icon: ShieldCheck,
                desc: "Claims written to stay inside the rules you work under.",
              },
              {
                title: "Enquiry Tracking",
                icon: LineChart,
                desc: "Enquiries traced back to what actually generated them.",
              },
            ],
          },
        ]}
      />
  )
}
