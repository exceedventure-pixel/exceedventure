import type { Metadata } from 'next'
import React from 'react'
import { Building2, Layers, Palette, Zap } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'
import { SubServiceGrid } from '@/components/SubServiceGrid'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('websites-softwares/custom-websites').catch(() => null)
  return generatePageMeta({
    slug: 'websites-softwares/custom-websites',
    seoDoc,
    fallbackTitle: 'Custom Websites',
    fallbackDescription:
      'Themes are cheap because they are built for everyone. The moment your business does something slightly unusual, you spend more fighting the template than a custom build would have cost.',
  })
}

export default function Page() {
  return (
    <>
      <ServiceDetail
        slug="websites-softwares/custom-websites"
        color="teal"
        icon={Building2}
        badge="Sub Service"
        titleLead="Custom "
        titleAccent="Websites"
        subtitle="Bespoke websites shaped around your product, audience, and business process."
        hero={{
          badge: 'Custom Websites',
          headline: 'A template only takes you ',
          headlineAccent: 'so far.',
          pain: 'Themes are cheap because they were built for everyone but you.',
          symptoms: [
            'You work around the theme’s limits',
            'Plugins stacked to force a fit',
            'It is slow and nobody knows why',
          ],
          primaryCta: { label: 'Get a free website review', href: '/contact' },
          secondaryCta: { label: 'See our work', href: '/our-works' },
        }}
        sections={[
          {
            color: 'teal',
            title: 'Built around your needs',
            subtitle: 'Custom solutions for businesses that need more than a standard template.',
            features: [
              {
                title: 'Tailored UX',
                icon: Layers,
                desc: 'Interfaces designed around your users and the actions you want them to take.',
              },
              {
                title: 'Unique Branding',
                icon: Palette,
                desc: 'Create a digital experience that feels unmistakably like your brand.',
              },
              {
                title: 'Advanced Functionality',
                icon: Zap,
                desc: 'Support complex flows, dashboards, portals, or interactive experiences.',
              },
            ],
          },
        ]}
      />
      <SubServiceGrid parentHref="/websites-softwares/custom-websites" />
    </>
  )
}
