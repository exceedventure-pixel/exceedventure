import type { Metadata } from 'next'
import React from 'react'
import { CreditCard, Package, Rocket } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('websites-softwares/e-commerce/single-product-sme-stores').catch(
    () => null,
  )
  return generatePageMeta({
    slug: 'websites-softwares/e-commerce/single-product-sme-stores',
    seoDoc,
    fallbackTitle: 'Single Product & SME Stores',
    fallbackDescription:
      'With a single product there is no browsing to fall back on. The page either answers every objection and closes the sale, or the visitor leaves.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="websites-softwares/e-commerce/single-product-sme-stores"
      color="teal"
      icon={Package}
      badge="Specialist Service"
      titleLead="Single Product & SME "
      titleAccent="Stores"
      subtitle="Lean stores for a single product or a small range, without enterprise overhead."
      hero={{
        badge: 'Single Product Stores',
        headline: 'One product. ',
        headlineAccent: 'Nowhere to hide.',
        pain: 'The page either answers every objection or the visitor leaves.',
        symptoms: [
          'One product in a generic store',
          'Objections unanswered on the page',
          'Traffic arrives and does not buy',
        ],
        primaryCta: { label: 'Get a free store review', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '/our-works' },
      }}
      sections={[
        {
          color: 'teal',
          title: 'What this service covers',
          subtitle:
            'Lean stores for a single product or a small range, without enterprise overhead.',
          features: [
            {
              title: 'Single Product Pages',
              icon: Package,
              desc: 'One product, given the whole page to make its case.',
            },
            {
              title: 'Fast Setup',
              icon: Rocket,
              desc: 'Live in weeks, not quarters.',
            },
            {
              title: 'Low Running Costs',
              icon: CreditCard,
              desc: 'Kept simple so the monthly cost stays small.',
            },
          ],
        },
      ]}
    />
  )
}
