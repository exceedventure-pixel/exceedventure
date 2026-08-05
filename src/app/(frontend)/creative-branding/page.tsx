import type { Metadata } from 'next'
import React from 'react'
import { Palette, BrushCleaning, FileText, Sparkles, PenTool, Layers } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('creative-branding').catch(() => null)
  return generatePageMeta({
    slug: 'creative-branding',
    seoDoc,
    fallbackTitle: 'Creative & Branding',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      color="purple"
      icon={Palette}
      badge="Creative Service"
      titleLead="Creative & "
      titleAccent="Branding"
      subtitle="Shape a brand that feels distinct, memorable, and built for long-term recognition."
      sections={[
        {
          color: 'purple',
          title: 'What this service is for',
          subtitle:
            'Creative direction and branding support for businesses that want stronger identity and presence.',
          features: [
            {
              title: 'Brand Design',
              icon: BrushCleaning,
              desc: 'Create visual systems that communicate your brand clearly and consistently.',
              items: ['Identity systems', 'Visual direction', 'Brand consistency'],
            },
            {
              title: 'Content Supply',
              icon: FileText,
              desc: 'Produce on-brand content that supports growth across channels.',
              items: ['Copywriting', 'Marketing content', 'Content pipelines'],
            },
            {
              title: 'Brand Materials',
              icon: Sparkles,
              desc: 'Develop the assets your business needs to present itself professionally.',
              items: ['Social visuals', 'Promotional assets', 'Brand toolkit'],
            },
          ],
        },
        {
          color: 'pink',
          muted: true,
          badge: 'Creative Execution',
          title: 'From identity to assets',
          subtitle:
            'A cohesive creative approach that strengthens both perception and performance.',
          features: [
            {
              title: 'Visual Storytelling',
              icon: PenTool,
              desc: 'Turn your brand message into visuals that connect with your audience.',
            },
            {
              title: 'Flexible Brand Systems',
              icon: Layers,
              desc: 'Create assets that are easy to apply across web, print, and campaigns.',
            },
          ],
        },
      ]}
    />
  )
}
