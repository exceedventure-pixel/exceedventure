import type { Metadata } from 'next'
import React from 'react'
import { CalendarClock, CreditCard, Headphones, Server } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("websites-softwares/pay-monthly-websites/pay-monthly-websites-uk").catch(() => null)
  return generatePageMeta({
    slug: "websites-softwares/pay-monthly-websites/pay-monthly-websites-uk",
    seoDoc,
    fallbackTitle: "Pay Monthly Websites UK",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        slug="websites-softwares/pay-monthly-websites/pay-monthly-websites-uk"
        color="teal"
        icon={CalendarClock}
        badge="Specialist Service"
        titleLead="Pay Monthly Websites "
        titleAccent="UK"
        subtitle="Professional websites for UK businesses on a fixed monthly fee."
        sections={[
          {
            color: "teal",
            title: 'What this service covers',
            subtitle: "Professional websites for UK businesses on a fixed monthly fee.",
            features: [
              {
                title: "No Large Upfront Cost",
                icon: CreditCard,
                desc: "Launch without a five-figure invoice at the start.",
              },
              {
                title: "Hosting Included",
                icon: Server,
                desc: "Hosting, domain and certificates handled in the fee.",
              },
              {
                title: "Support Included",
                icon: Headphones,
                desc: "Changes and fixes covered rather than billed each time.",
              },
            ],
          },
        ]}
      />
  )
}
