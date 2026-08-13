import type { Metadata } from 'next'
import React from 'react'
import { Database, Layers, Server } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO(
    'websites-softwares/custom-web-systems/headless-payload-cms-architectures',
  ).catch(() => null)
  return generatePageMeta({
    slug: 'websites-softwares/custom-web-systems/headless-payload-cms-architectures',
    seoDoc,
    fallbackTitle: 'Headless Payload CMS Architectures',
    fallbackDescription:
      'The same product details retyped into the site, the app and the newsletter. Content should be stored once and published everywhere it is needed.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="websites-softwares/custom-web-systems/headless-payload-cms-architectures"
      color="teal"
      icon={Database}
      badge="Specialist Service"
      titleLead="Headless Payload CMS "
      titleAccent="Architectures"
      subtitle="Headless Payload CMS setups that separate content from how it gets presented."
      hero={{
        badge: 'Headless CMS',
        headline: 'Your content is trapped ',
        headlineAccent: 'in your website.',
        pain: 'The same details retyped into the site, the app and the newsletter.',
        symptoms: [
          'Content maintained in several places',
          'The CMS dictates the front end',
          'New channels mean rebuilding',
        ],
        primaryCta: { label: 'Book a free architecture review', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '/our-works' },
      }}
      sections={[
        {
          color: 'teal',
          title: 'What this service covers',
          subtitle: 'Headless Payload CMS setups that separate content from how it gets presented.',
          features: [
            {
              title: 'Payload CMS Builds',
              icon: Database,
              desc: 'A CMS modelled on your content, not the other way round.',
            },
            {
              title: 'Custom Collections',
              icon: Layers,
              desc: 'Structures and relationships that match how you actually work.',
            },
            {
              title: 'API-First Delivery',
              icon: Server,
              desc: 'Content available to any front-end, site or app.',
            },
          ],
        },
      ]}
    />
  )
}
