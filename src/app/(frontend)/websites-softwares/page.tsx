import type { Metadata } from 'next'
import React from 'react'
import { Globe, LayoutTemplate, ShoppingCart, Building2, Palette, Shield } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'
import { serviceHero } from '@/config/services'
import { AccentSync } from '@/components/AccentSync'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('websites-softwares').catch(() => null)
  return generatePageMeta({
    slug: 'websites-softwares',
    seoDoc,
    fallbackTitle: 'Websites & Softwares',
    fallbackDescription:
      'If your site looks dated, loads slowly, or needs a developer to change one line of text, it is quietly costing you enquiries every week — and you have no way of seeing how many.',
  })
}

export default function Page() {
  return (
    <>
      {/* Hands this page's colour to the header, so its buttons wear the
          same wash this page paints behind its hero. */}
      <AccentSync color="teal" />
      <ServiceDetail
        slug="websites-softwares"
        color="teal"
        icon={Globe}
        badge="Core Service"
        titleLead="Websites & "
        titleAccent="Softwares"
        subtitle="Launch polished digital products with flexible websites, ecommerce, and custom software experiences."
        hero={{
          ...serviceHero('websites-softwares'),
          badge: 'Websites & Software',
          symptoms: [
            'You cannot edit it yourself',
            'Visitors leave without contacting you',
            'It falls apart on a phone',
          ],
          primaryCta: { label: 'Get a free website review', href: '/contact' },
          secondaryCta: { label: 'See our work', href: '/our-works' },
        }}
        sections={[
          {
            color: 'teal',
            title: 'What this service is for',
            subtitle:
              'Solutions built for modern brands, service businesses, and growing online stores.',
            features: [
              {
                title: 'WordPress',
                icon: LayoutTemplate,
                desc: 'Scalable content sites, landing pages, and business websites.',
                items: ['Content-first websites', 'SEO-ready pages', 'Flexible plugin ecosystem'],
              },
              {
                title: 'E-commerce',
                icon: ShoppingCart,
                desc: 'Online stores designed to turn visitors into paying customers.',
                items: ['Product pages', 'Checkout flow', 'Inventory-ready storefronts'],
              },
              {
                title: 'Custom Websites',
                icon: Building2,
                desc: 'Tailor-made websites for unique business needs and brand positioning.',
                items: ['Fully custom UX', 'Advanced interactions', 'Performance-focused builds'],
              },
              {
                title: 'Pay Monthly Websites',
                icon: Shield,
                desc: 'Flexible website solutions with low upfront cost and manageable monthly plans.',
                items: ['Launch faster', 'Ongoing support', 'Budget-friendly growth'],
              },
            ],
          },
          {
            color: 'blue',
            muted: true,
            badge: 'Design & Experience',
            title: 'Built for conversion and growth',
            subtitle: 'Every build is shaped around clarity, speed, and a strong user journey.',
            features: [
              {
                title: 'Modern UX',
                icon: Palette,
                desc: 'Clean, conversion-focused interfaces with clear calls to action.',
              },
              {
                title: 'Fast Performance',
                icon: Globe,
                desc: 'Optimized to load quickly and rank better in search.',
              },
              {
                title: 'Scalable Foundations',
                icon: Building2,
                desc: 'Create a platform that can grow as your business expands.',
              },
            ],
          },
        ]}
      />
    </>
  )
}
