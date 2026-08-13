import type { Metadata } from 'next'
import React from 'react'
import { Code2, Plug, RefreshCw } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('websites-softwares/shopify/shopify-development-agency').catch(
    () => null,
  )
  return generatePageMeta({
    slug: 'websites-softwares/shopify/shopify-development-agency',
    seoDoc,
    fallbackTitle: 'Shopify Development Agency',
    fallbackDescription:
      'Bundles, subscriptions, unusual shipping rules, an ERP that has to stay in sync. The moment your business is not standard, you need someone who can build rather than install.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="websites-softwares/shopify/shopify-development-agency"
      color="teal"
      icon={Code2}
      badge="Specialist Service"
      titleLead="Shopify Development "
      titleAccent="Agency"
      subtitle="Development support for themes, apps and the parts Shopify doesn't do out of the box."
      hero={{
        badge: 'Shopify Development',
        headline: 'When Shopify cannot do it ',
        headlineAccent: 'out of the box.',
        pain: 'The moment your business is not standard, installing apps stops working.',
        symptoms: [
          'No app does quite what you need',
          'Apps bought to patch other apps',
          'Your store ignores your other systems',
        ],
        primaryCta: { label: 'Get a free store review', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '/our-works' },
      }}
      sections={[
        {
          color: 'teal',
          title: 'What this service covers',
          subtitle:
            "Development support for themes, apps and the parts Shopify doesn't do out of the box.",
          features: [
            {
              title: 'Theme Development',
              icon: Code2,
              desc: 'Custom theme work beyond what the editor allows.',
            },
            {
              title: 'App Integrations',
              icon: Plug,
              desc: 'Third-party tools connected without slowing the store down.',
            },
            {
              title: 'Migrations',
              icon: RefreshCw,
              desc: 'Move onto Shopify with products, URLs and history intact.',
            },
          ],
        },
      ]}
    />
  )
}
