import type { Metadata } from 'next'
import React from 'react'
import { BrushCleaning, LayoutTemplate, Palette, Sparkles } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'
import { SubServiceGrid } from '@/components/SubServiceGrid'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('creative-branding/brand-design').catch(() => null)
  return generatePageMeta({
    slug: 'creative-branding/brand-design',
    seoDoc,
    fallbackTitle: 'Brand Design',
  })
}

export default function Page() {
  return (
    <>
    <ServiceDetail
      color="purple"
      icon={BrushCleaning}
      badge="Sub Service"
      titleLead="Brand "
      titleAccent="Design"
      subtitle="Build a visual identity that strengthens recognition, trust, and overall brand presence."
      sections={[
        {
          color: 'purple',
          title: 'What this service delivers',
          subtitle:
            'A consistent visual direction for businesses that want to present themselves more clearly.',
          features: [
            {
              title: 'Identity Systems',
              icon: Palette,
              desc: 'Create the core visual elements that define your brand at a glance.',
            },
            {
              title: 'Brand Consistency',
              icon: LayoutTemplate,
              desc: 'Ensure your visuals feel polished across web, print, and campaigns.',
            },
            {
              title: 'Distinctive Presence',
              icon: Sparkles,
              desc: 'Develop a stronger visual story that feels memorable and professional.',
            },
          ],
        },
      ]}
    />
      <SubServiceGrid parentHref="/creative-branding/brand-design" />
    </>
  )
}
