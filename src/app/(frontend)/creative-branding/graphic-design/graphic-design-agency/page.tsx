import type { Metadata } from 'next'
import React from 'react'
import { Brush, Handshake, Layers, Palette } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("creative-branding/graphic-design/graphic-design-agency").catch(() => null)
  return generatePageMeta({
    slug: "creative-branding/graphic-design/graphic-design-agency",
    seoDoc,
    fallbackTitle: "Graphic Design Agency",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        color="purple"
        icon={Brush}
        badge="Specialist Service"
        titleLead="Graphic Design "
        titleAccent="Agency"
        subtitle="A design partner for bigger campaigns and continuing work."
        sections={[
          {
            color: "purple",
            title: 'What this service covers',
            subtitle: "A design partner for bigger campaigns and continuing work.",
            features: [
              {
                title: "Campaign Design",
                icon: Layers,
                desc: "Complete campaigns designed as one coherent set.",
              },
              {
                title: "Brand Consistency",
                icon: Palette,
                desc: "Every asset unmistakably yours.",
              },
              {
                title: "Ongoing Retainer",
                icon: Handshake,
                desc: "A predictable amount of design capacity each month.",
              },
            ],
          },
        ]}
      />
  )
}
