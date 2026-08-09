import type { Metadata } from 'next'
import React from 'react'
import { CalendarCheck, Palette, PenTool, RefreshCw } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("websites-softwares/pay-monthly-websites/pay-monthly-website-design").catch(() => null)
  return generatePageMeta({
    slug: "websites-softwares/pay-monthly-websites/pay-monthly-website-design",
    seoDoc,
    fallbackTitle: "Pay Monthly Website Design",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        slug="websites-softwares/pay-monthly-websites/pay-monthly-website-design"
        color="teal"
        icon={Palette}
        badge="Specialist Service"
        titleLead="Pay Monthly Website "
        titleAccent="Design"
        subtitle="Design, build and maintenance bundled into one predictable monthly payment."
        sections={[
          {
            color: "teal",
            title: 'What this service covers',
            subtitle: "Design, build and maintenance bundled into one predictable monthly payment.",
            features: [
              {
                title: "Design & Build",
                icon: PenTool,
                desc: "A properly designed site, paid for over time.",
              },
              {
                title: "Ongoing Changes",
                icon: RefreshCw,
                desc: "Updates as the business changes, included.",
              },
              {
                title: "Predictable Billing",
                icon: CalendarCheck,
                desc: "One figure a month, so budgeting stays simple.",
              },
            ],
          },
        ]}
      />
  )
}
