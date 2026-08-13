import type { Metadata } from 'next'
import React from 'react'
import { Brush, PenTool, BookOpen, Layers, FileText, Package } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('solutions/branding').catch(() => null)
  return generatePageMeta({
    slug: 'solutions/branding',
    seoDoc,
    fallbackTitle: 'Branding',
    fallbackDescription:
      'Customers form a judgement about you in seconds, long before they read a word about what you do. Right now that judgement is being made by accident.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="solutions/branding"
      color="purple"
      icon={Brush}
      badge="Creative Service"
      titleLead="Bran"
      titleAccent="ding"
      subtitle="Elevate your brand with distinctive design and creative assets that resonate."
      hero={{
        badge: 'Branding',
        headline: 'Good work, ',
        headlineAccent: 'forgettable brand.',
        pain: 'Customers judge you in seconds, and right now that happens by accident.',
        symptoms: [
          'Designed once, never revisited',
          'You look smaller than you are',
          'Nothing is written down',
        ],
        primaryCta: { label: 'Get a free brand review', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '/our-works' },
      }}
      sections={[
        {
          color: 'purple',
          title: 'What this service is for',
          subtitle:
            'Strategic branding and design solutions that define your identity and captivate your audience.',
          features: [
            {
              title: 'Logo Design',
              icon: PenTool,
              desc: "Distinctive, versatile logos that capture your brand's essence at any size.",
            },
            {
              title: 'Brand Guideline',
              icon: BookOpen,
              desc: 'A clear rulebook for colors, type, and usage so your brand stays consistent everywhere.',
            },
            {
              title: 'Brand Materials',
              icon: Layers,
              desc: 'Business cards, social templates, and marketing assets that look unmistakably you.',
            },
            {
              title: 'Corporate Documents',
              icon: FileText,
              desc: 'Brochures, leaflets, and documentation designed with a polished, professional finish.',
            },
            {
              title: 'Branded Product Supply',
              icon: Package,
              desc: "Branded merchandise and physical products that put your identity in customers' hands.",
            },
          ],
        },
      ]}
    />
  )
}
