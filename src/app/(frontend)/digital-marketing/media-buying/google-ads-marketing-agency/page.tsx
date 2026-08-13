import type { Metadata } from 'next'
import React from 'react'
import { Chrome, Gauge, Search, Target } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO(
    'digital-marketing/media-buying/google-ads-marketing-agency',
  ).catch(() => null)
  return generatePageMeta({
    slug: 'digital-marketing/media-buying/google-ads-marketing-agency',
    seoDoc,
    fallbackTitle: 'Google Ads Marketing Agency',
    fallbackDescription:
      'Loose match types and no negatives mean your budget answers questions you cannot help with. The searches that actually matter get whatever is left over.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="digital-marketing/media-buying/google-ads-marketing-agency"
      color="blue"
      icon={Chrome}
      badge="Specialist Service"
      titleLead="Google Ads Marketing "
      titleAccent="Agency"
      subtitle="Search, shopping and display campaigns managed against your cost per lead."
      hero={{
        badge: 'Google Ads',
        headline: 'Paying for clicks from people ',
        headlineAccent: 'who will never buy.',
        pain: 'Loose match types spend your budget on questions you cannot help with.',
        symptoms: [
          'Search terms full of junk queries',
          'No real negative keyword list',
          'Landing pages do not match the ads',
        ],
        primaryCta: { label: 'Get a free Google Ads review', href: '/contact' },
        secondaryCta: { label: 'See pricing', href: '/pricing' },
      }}
      sections={[
        {
          color: 'blue',
          title: 'What this service covers',
          subtitle: 'Search, shopping and display campaigns managed against your cost per lead.',
          features: [
            {
              title: 'Search & Shopping',
              icon: Search,
              desc: 'Campaigns built for intent, where buyers are already looking.',
            },
            {
              title: 'Keyword Strategy',
              icon: Target,
              desc: 'Terms chosen for margin, not just for volume.',
            },
            {
              title: 'Cost Per Lead Control',
              icon: Gauge,
              desc: 'Bids and budgets steered by what a lead is worth to you.',
            },
          ],
        },
      ]}
    />
  )
}
