import type { Metadata } from 'next'
import React from 'react'
import { Palette, PenTool, Smartphone, Store } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('websites-softwares/shopify/shopify-web-design').catch(() => null)
  return generatePageMeta({
    slug: 'websites-softwares/shopify/shopify-web-design',
    seoDoc,
    fallbackTitle: 'Shopify Web Design',
    fallbackDescription:
      'Themes are built to demo well with sample products. Yours has different photography, a different catalogue and different customers — and it shows.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="websites-softwares/shopify/shopify-web-design"
      color="teal"
      icon={Palette}
      badge="Specialist Service"
      titleLead="Shopify Web "
      titleAccent="Design"
      subtitle="Storefront design that reflects your brand and moves shoppers toward checkout."
      hero={{
        badge: 'Shopify Design',
        headline: 'Your theme was built for ',
        headlineAccent: 'somebody else.',
        pain: 'Themes demo beautifully with sample products — yours are not sample products.',
        symptoms: [
          'The theme fights your photography',
          'Your catalogue does not fit',
          'Mobile was an afterthought',
        ],
        primaryCta: { label: 'Get a free store review', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '/our-works' },
      }}
      sections={[
        {
          color: 'teal',
          title: 'What this service covers',
          subtitle:
            'Storefront design that reflects your brand and moves shoppers toward checkout.',
          features: [
            {
              title: 'Custom Storefronts',
              icon: Store,
              desc: 'A storefront that looks like you, not like everyone else.',
            },
            {
              title: 'Brand-Led Layouts',
              icon: PenTool,
              desc: 'Product and category pages designed around your range.',
            },
            {
              title: 'Mobile-First Checkout',
              icon: Smartphone,
              desc: 'Built for the phone, where most of your orders happen.',
            },
          ],
        },
      ]}
    />
  )
}
