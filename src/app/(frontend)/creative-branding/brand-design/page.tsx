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
    fallbackDescription:
      'Most businesses have a logo and nothing else — no colour rules, no type, no direction. So every new piece of design starts another argument.',
  })
}

export default function Page() {
  return (
    <>
      <ServiceDetail
        slug="creative-branding/brand-design"
        color="purple"
        icon={BrushCleaning}
        badge="Sub Service"
        titleLead="Brand "
        titleAccent="Design"
        subtitle="Build a visual identity that strengthens recognition, trust, and overall brand presence."
        hero={{
          badge: 'Brand Design',
          headline: 'A logo is not a brand. ',
          headlineAccent: 'Yours needs the rest.',
          pain: 'No colour rules, no type, no direction — so every design starts an argument.',
          symptoms: [
            'The logo is the only fixed thing',
            'Every designer reads it differently',
            'Nothing you make looks related',
          ],
          primaryCta: { label: 'Get a free brand review', href: '/contact' },
          secondaryCta: { label: 'See our work', href: '/our-works' },
        }}
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
