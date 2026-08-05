import type { Metadata } from 'next'
import React from 'react'
import { Sparkles, PackageOpen, PenTool, Layers } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('creative-branding/brand-materials').catch(() => null)
  return generatePageMeta({
    slug: 'creative-branding/brand-materials',
    seoDoc,
    fallbackTitle: 'Brand Materials',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      color="purple"
      icon={Sparkles}
      badge="Sub Service"
      titleLead="Brand "
      titleAccent="Materials"
      subtitle="Create the assets that help your brand show up polished, professional, and ready for growth."
      sections={[
        {
          color: 'purple',
          title: 'What this service provides',
          subtitle:
            'A practical set of brand assets that support daily presentation and promotion.',
          features: [
            {
              title: 'Asset Creation',
              icon: PackageOpen,
              desc: 'Develop the visual and promotional materials your brand needs in regular use.',
            },
            {
              title: 'Ready-to-Use Content',
              icon: PenTool,
              desc: 'Prepare assets that can be shared across campaigns, channels, and internal use.',
            },
            {
              title: 'Consistent Presentation',
              icon: Layers,
              desc: 'Keep your brand materials aligned across touchpoints and communication moments.',
            },
          ],
        },
      ]}
    />
  )
}
