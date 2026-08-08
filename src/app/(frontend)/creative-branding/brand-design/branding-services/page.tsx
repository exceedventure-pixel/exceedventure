import type { Metadata } from 'next'
import React from 'react'
import { BookOpen, Palette, PenTool } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("creative-branding/brand-design/branding-services").catch(() => null)
  return generatePageMeta({
    slug: "creative-branding/brand-design/branding-services",
    seoDoc,
    fallbackTitle: "Branding Services",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        color="purple"
        icon={Palette}
        badge="Specialist Service"
        titleLead="Branding "
        titleAccent="Services"
        subtitle="Brand identities built to stay recognisable across every touchpoint."
        sections={[
          {
            color: "purple",
            title: 'What this service covers',
            subtitle: "Brand identities built to stay recognisable across every touchpoint.",
            features: [
              {
                title: "Logo & Marks",
                icon: PenTool,
                desc: "A primary mark plus the variants real use demands.",
              },
              {
                title: "Colour & Type",
                icon: Palette,
                desc: "A palette and type scale that hold up everywhere.",
              },
              {
                title: "Usage Rules",
                icon: BookOpen,
                desc: "Clear guidance so the brand survives contact with other people.",
              },
            ],
          },
        ]}
      />
  )
}
