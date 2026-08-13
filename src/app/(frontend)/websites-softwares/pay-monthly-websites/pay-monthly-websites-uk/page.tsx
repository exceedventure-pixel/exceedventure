import type { Metadata } from 'next'
import React from 'react'
import { CalendarClock, CreditCard, Headphones, Server } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO(
    'websites-softwares/pay-monthly-websites/pay-monthly-websites-uk',
  ).catch(() => null)
  return generatePageMeta({
    slug: 'websites-softwares/pay-monthly-websites/pay-monthly-websites-uk',
    seoDoc,
    fallbackTitle: 'Pay Monthly Websites UK',
    fallbackDescription:
      'Paying for a site in one go competes with stock, wages and rent. A monthly cost sits in the marketing budget, which is where it belongs.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="websites-softwares/pay-monthly-websites/pay-monthly-websites-uk"
      color="teal"
      icon={CalendarClock}
      badge="Specialist Service"
      titleLead="Pay Monthly Websites "
      titleAccent="UK"
      subtitle="Professional websites for UK businesses on a fixed monthly fee."
      hero={{
        badge: 'Pay Monthly · UK',
        headline: 'A website your cash flow ',
        headlineAccent: 'can live with.',
        pain: 'A monthly cost sits in the marketing budget, where it belongs.',
        symptoms: [
          'One large invoice does not suit you',
          'You would rather budget monthly',
          'You need it live sooner than that',
        ],
        primaryCta: { label: 'Check if you qualify', href: '/contact' },
        secondaryCta: { label: 'See monthly plans', href: '/pricing' },
        reassurance: 'No large deposit. Terms in writing.',
      }}
      sections={[
        {
          color: 'teal',
          title: 'What this service covers',
          subtitle: 'Professional websites for UK businesses on a fixed monthly fee.',
          features: [
            {
              title: 'No Large Upfront Cost',
              icon: CreditCard,
              desc: 'Launch without a five-figure invoice at the start.',
            },
            {
              title: 'Hosting Included',
              icon: Server,
              desc: 'Hosting, domain and certificates handled in the fee.',
            },
            {
              title: 'Support Included',
              icon: Headphones,
              desc: 'Changes and fixes covered rather than billed each time.',
            },
          ],
        },
      ]}
    />
  )
}
