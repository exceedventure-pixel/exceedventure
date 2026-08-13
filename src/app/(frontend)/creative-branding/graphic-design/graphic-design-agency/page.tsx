import type { Metadata } from 'next'
import React from 'react'
import { Brush, Handshake, Layers, Palette } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('creative-branding/graphic-design/graphic-design-agency').catch(
    () => null,
  )
  return generatePageMeta({
    slug: 'creative-branding/graphic-design/graphic-design-agency',
    seoDoc,
    fallbackTitle: 'Graphic Design Agency',
    fallbackDescription:
      'Hiring a designer means a salary, enough work to justify it, and a gap whenever they are away. Most businesses need the output, not the employee.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="creative-branding/graphic-design/graphic-design-agency"
      color="purple"
      icon={Brush}
      badge="Specialist Service"
      titleLead="Graphic Design "
      titleAccent="Agency"
      subtitle="A design partner for bigger campaigns and continuing work."
      hero={{
        badge: 'Design Agency',
        headline: 'A design team ',
        headlineAccent: 'without the headcount.',
        pain: 'You need the output, not the salary, the pipeline and the cover gaps.',
        symptoms: [
          'Work stacks up between freelancers',
          'Cannot justify a full-time hire',
          'Quality varies by who is free',
        ],
        primaryCta: { label: 'Get a free design review', href: '/contact' },
        secondaryCta: { label: 'See pricing', href: '/pricing' },
      }}
      sections={[
        {
          color: 'purple',
          title: 'What this service covers',
          subtitle: 'A design partner for bigger campaigns and continuing work.',
          features: [
            {
              title: 'Campaign Design',
              icon: Layers,
              desc: 'Complete campaigns designed as one coherent set.',
            },
            {
              title: 'Brand Consistency',
              icon: Palette,
              desc: 'Every asset unmistakably yours.',
            },
            {
              title: 'Ongoing Retainer',
              icon: Handshake,
              desc: 'A predictable amount of design capacity each month.',
            },
          ],
        },
      ]}
    />
  )
}
