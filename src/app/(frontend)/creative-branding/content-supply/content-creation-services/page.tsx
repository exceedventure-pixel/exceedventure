import type { Metadata } from 'next'
import React from 'react'
import { ClipboardList, PenTool, Repeat, Sparkles } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("creative-branding/content-supply/content-creation-services").catch(() => null)
  return generatePageMeta({
    slug: "creative-branding/content-supply/content-creation-services",
    seoDoc,
    fallbackTitle: "Content Creation Services",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        slug="creative-branding/content-supply/content-creation-services"
        color="purple"
        icon={Sparkles}
        badge="Specialist Service"
        titleLead="Content Creation "
        titleAccent="Services"
        subtitle="A steady supply of on-brand content across the formats you need."
        sections={[
          {
            color: "purple",
            title: 'What this service covers',
            subtitle: "A steady supply of on-brand content across the formats you need.",
            features: [
              {
                title: "Content Planning",
                icon: ClipboardList,
                desc: "A calendar you can see a quarter ahead on.",
              },
              {
                title: "Copy & Visuals",
                icon: PenTool,
                desc: "Words and imagery produced together, not bolted on after.",
              },
              {
                title: "Consistent Cadence",
                icon: Repeat,
                desc: "Publishing that keeps its rhythm through busy months.",
              },
            ],
          },
        ]}
      />
  )
}
