import type { Metadata } from 'next'
import React from 'react'
import { ShoppingCart, CreditCard, TrendingUp, ShieldCheck } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'
import { SubServiceGrid } from '@/components/SubServiceGrid'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('websites-softwares/e-commerce').catch(() => null)
  return generatePageMeta({
    slug: 'websites-softwares/e-commerce',
    seoDoc,
    fallbackTitle: 'E-commerce',
  })
}

export default function Page() {
  return (
    <>
    <ServiceDetail
      color="teal"
      icon={ShoppingCart}
      badge="Sub Service"
      titleLead="E-"
      titleAccent="commerce"
      subtitle="High-converting online stores designed to simplify shopping and strengthen revenue."
      sections={[
        {
          color: 'teal',
          title: 'What this service includes',
          subtitle:
            'Commerce experiences that combine product presentation, checkout simplicity, and trust.',
          features: [
            {
              title: 'Storefront Design',
              icon: ShoppingCart,
              desc: 'Create clear product experiences that guide visitors toward purchase.',
            },
            {
              title: 'Secure Checkout',
              icon: CreditCard,
              desc: 'Offer smooth, reliable checkout flows with payment confidence.',
            },
            {
              title: 'Growth-Oriented UX',
              icon: TrendingUp,
              desc: 'Improve conversion through better structure, clarity, and persuasive design.',
            },
            {
              title: 'Reliability & Trust',
              icon: ShieldCheck,
              desc: 'Support customer confidence with polished, dependable ecommerce experiences.',
            },
          ],
        },
      ]}
    />
      <SubServiceGrid parentHref="/websites-softwares/e-commerce" />
    </>
  )
}
