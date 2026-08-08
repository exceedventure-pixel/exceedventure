import type { Metadata } from 'next'
import React from 'react'
import { BookOpen, Printer, Wrench } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("creative-branding/brand-materials/brochures-flyers-leaflets").catch(() => null)
  return generatePageMeta({
    slug: "creative-branding/brand-materials/brochures-flyers-leaflets",
    seoDoc,
    fallbackTitle: "Brochures, Flyers & Leaflets",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        color="purple"
        icon={Printer}
        badge="Specialist Service"
        titleLead="Brochures, Flyers & "
        titleAccent="Leaflets"
        subtitle="Print collateral designed to be handed over and kept."
        sections={[
          {
            color: "purple",
            title: 'What this service covers',
            subtitle: "Print collateral designed to be handed over and kept.",
            features: [
              {
                title: "Brochure Design",
                icon: BookOpen,
                desc: "Longer-form print that carries a full argument.",
              },
              {
                title: "Flyers & Leaflets",
                icon: Printer,
                desc: "Short-run pieces for events, drops and counters.",
              },
              {
                title: "Print Specification",
                icon: Wrench,
                desc: "Stock, finish and sizing specified so quotes come back right.",
              },
            ],
          },
        ]}
      />
  )
}
