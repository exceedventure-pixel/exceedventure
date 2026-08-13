import type { Metadata } from 'next'
import React from 'react'
import { Award, CreditCard, Store, TrendingUp } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO(
    'websites-softwares/e-commerce/ecommerce-website-design-uk',
  ).catch(() => null)
  return generatePageMeta({
    slug: 'websites-softwares/e-commerce/ecommerce-website-design-uk',
    seoDoc,
    fallbackTitle: 'Ecommerce Website Design UK',
    fallbackDescription:
      'An attractive store that hides the buy button is a portfolio piece, not a shop. Every design decision should shorten the distance to a completed order.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="websites-softwares/e-commerce/ecommerce-website-design-uk"
      color="teal"
      icon={Store}
      badge="Specialist Service"
      titleLead="Ecommerce Website Design "
      titleAccent="UK"
      subtitle="Online stores designed for UK retailers, with the trust signals shoppers expect."
      hero={{
        badge: 'E-commerce Design · UK',
        headline: 'Design that gets people ',
        headlineAccent: 'to checkout.',
        pain: 'A store that hides the buy button is a portfolio piece, not a shop.',
        symptoms: [
          'Lovely pages, poor conversion',
          'Search and filters are hard to find',
          'The buy button competes for attention',
        ],
        primaryCta: { label: 'Get a free store review', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '/our-works' },
      }}
      sections={[
        {
          color: 'teal',
          title: 'What this service covers',
          subtitle:
            'Online stores designed for UK retailers, with the trust signals shoppers expect.',
          features: [
            {
              title: 'Conversion-Led Design',
              icon: TrendingUp,
              desc: 'Layouts built around the path to checkout.',
            },
            {
              title: 'UK Payments & Tax',
              icon: CreditCard,
              desc: 'Gateways, VAT and delivery rules configured for the UK.',
            },
            {
              title: 'Trust & Reviews',
              icon: Award,
              desc: 'Review, returns and security signals where buyers look for them.',
            },
          ],
        },
      ]}
    />
  )
}
