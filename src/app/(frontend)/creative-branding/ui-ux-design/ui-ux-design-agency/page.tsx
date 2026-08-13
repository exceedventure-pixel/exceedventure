import type { Metadata } from 'next'
import React from 'react'
import { Code2, Component, Layers, Monitor } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('creative-branding/ui-ux-design/ui-ux-design-agency').catch(
    () => null,
  )
  return generatePageMeta({
    slug: 'creative-branding/ui-ux-design/ui-ux-design-agency',
    seoDoc,
    fallbackTitle: 'UI UX Design Agency',
    fallbackDescription:
      'Redesigns settled by whoever is loudest in the room move the numbers in whichever direction luck decides. Evidence is a great deal cheaper than a rebuild.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="creative-branding/ui-ux-design/ui-ux-design-agency"
      color="purple"
      icon={Monitor}
      badge="Specialist Service"
      titleLead="UI UX Design "
      titleAccent="Agency"
      subtitle="A design team for products, dashboards and genuinely complex interfaces."
      hero={{
        badge: 'UI/UX Agency',
        headline: 'Design decisions backed by ',
        headlineAccent: 'more than taste.',
        pain: 'Evidence is a great deal cheaper than a rebuild.',
        symptoms: [
          'Arguments settled by seniority',
          'Nobody measured the last redesign',
          'Analytics and design never meet',
        ],
        primaryCta: { label: 'Get a free UX review', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '/our-works' },
      }}
      sections={[
        {
          color: 'purple',
          title: 'What this service covers',
          subtitle: 'A design team for products, dashboards and genuinely complex interfaces.',
          features: [
            {
              title: 'Interface Systems',
              icon: Component,
              desc: 'Consistent patterns across every screen in the product.',
            },
            {
              title: 'Design Systems',
              icon: Layers,
              desc: 'A component library your developers can build straight from.',
            },
            {
              title: 'Handover to Build',
              icon: Code2,
              desc: 'Specs and assets developers can work from without guessing.',
            },
          ],
        },
      ]}
    />
  )
}
