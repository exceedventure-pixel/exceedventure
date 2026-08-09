import type { Metadata } from 'next'
import React from 'react'
import { Compass, Lightbulb, ShieldCheck } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("automation-ai/ai-consultancy/ai-strategy-consulting").catch(() => null)
  return generatePageMeta({
    slug: "automation-ai/ai-consultancy/ai-strategy-consulting",
    seoDoc,
    fallbackTitle: "AI Strategy & Consulting",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        slug="automation-ai/ai-consultancy/ai-strategy-consulting"
        color="red"
        icon={Compass}
        badge="Specialist Service"
        titleLead="AI Strategy & "
        titleAccent="Consulting"
        subtitle="A grounded plan for where AI fits in your business, and where it doesn't."
        sections={[
          {
            color: "red",
            title: 'What this service covers',
            subtitle: "A grounded plan for where AI fits in your business, and where it doesn't.",
            features: [
              {
                title: "Opportunity Mapping",
                icon: Lightbulb,
                desc: "The places AI would genuinely pay for itself.",
              },
              {
                title: "Roadmap & Sequencing",
                icon: Compass,
                desc: "What to do first, and what can wait.",
              },
              {
                title: "Risk & Governance",
                icon: ShieldCheck,
                desc: "Data, accuracy and accountability considered up front.",
              },
            ],
          },
        ]}
      />
  )
}
