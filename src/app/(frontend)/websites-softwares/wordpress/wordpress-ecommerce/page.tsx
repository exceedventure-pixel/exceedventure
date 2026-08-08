import type { Metadata } from 'next'
import React from 'react'
import { Boxes, CreditCard, ShoppingCart, Store } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("websites-softwares/wordpress/wordpress-ecommerce").catch(() => null)
  return generatePageMeta({
    slug: "websites-softwares/wordpress/wordpress-ecommerce",
    seoDoc,
    fallbackTitle: "WordPress E-commerce",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        color="teal"
        icon={ShoppingCart}
        badge="Specialist Service"
        titleLead="WordPress "
        titleAccent="E-commerce"
        subtitle="WooCommerce storefronts built to handle real catalogues and real order volume."
        sections={[
          {
            color: "teal",
            title: 'What this service covers',
            subtitle: "WooCommerce storefronts built to handle real catalogues and real order volume.",
            features: [
              {
                title: "WooCommerce Builds",
                icon: Store,
                desc: "Product, cart and checkout flows configured around how you sell.",
              },
              {
                title: "Payments & Shipping",
                icon: CreditCard,
                desc: "Gateways, tax and delivery rules set up and tested.",
              },
              {
                title: "Catalogue at Scale",
                icon: Boxes,
                desc: "Structures that stay fast as your product count grows.",
              },
            ],
          },
        ]}
      />
  )
}
