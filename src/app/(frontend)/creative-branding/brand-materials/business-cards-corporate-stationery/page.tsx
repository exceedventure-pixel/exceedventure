import type { Metadata } from 'next'
import React from 'react'
import { CreditCard, FileText, Printer } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO(
    'creative-branding/brand-materials/business-cards-corporate-stationery',
  ).catch(() => null)
  return generatePageMeta({
    slug: 'creative-branding/brand-materials/business-cards-corporate-stationery',
    seoDoc,
    fallbackTitle: 'Business Cards & Corporate Stationery',
    fallbackDescription:
      'A card is often the only physical object a prospect keeps. A thin, generic one quietly tells them exactly how much you invest in your own work.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="creative-branding/brand-materials/business-cards-corporate-stationery"
      color="purple"
      icon={CreditCard}
      badge="Specialist Service"
      titleLead="Business Cards & Corporate "
      titleAccent="Stationery"
      subtitle="Cards and stationery that match the rest of your brand."
      hero={{
        badge: 'Stationery',
        headline: 'The smallest thing you hand over ',
        headlineAccent: 'says the most.',
        pain: 'A card is often the only physical thing a prospect keeps.',
        symptoms: [
          'Cards made on a template site',
          'Every card looks slightly different',
          'No matching letterhead',
        ],
        primaryCta: { label: 'Get a free stationery review', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '/our-works' },
      }}
      sections={[
        {
          color: 'purple',
          title: 'What this service covers',
          subtitle: 'Cards and stationery that match the rest of your brand.',
          features: [
            {
              title: 'Business Cards',
              icon: CreditCard,
              desc: 'The first physical thing people keep from you.',
            },
            {
              title: 'Letterheads & Compliments',
              icon: FileText,
              desc: 'Correspondence that looks like it came from you.',
            },
            {
              title: 'Print-Ready Files',
              icon: Printer,
              desc: 'Artwork your printer can run without coming back.',
            },
          ],
        },
      ]}
    />
  )
}
