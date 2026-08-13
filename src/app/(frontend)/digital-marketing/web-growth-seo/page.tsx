import type { Metadata } from 'next'
import React from 'react'
import { TrendingUp, Search, BarChart3, ShieldCheck } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'
import { SubServiceGrid } from '@/components/SubServiceGrid'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('digital-marketing/web-growth-seo').catch(() => null)
  return generatePageMeta({
    slug: 'digital-marketing/web-growth-seo',
    seoDoc,
    fallbackTitle: 'Web Growth SEO',
    fallbackDescription:
      'Your competitors are not better than you. They are just easier to find. Every month you sit below the fold is a month of enquiries going somewhere else.',
  })
}

export default function Page() {
  return (
    <>
      <ServiceDetail
        slug="digital-marketing/web-growth-seo"
        color="blue"
        icon={TrendingUp}
        badge="Sub Service"
        titleLead="Web Growth "
        titleAccent="SEO"
        subtitle="Strengthen your search visibility with strategy, technical improvements, and smarter content."
        hero={{
          badge: 'SEO',
          headline: 'You are on page two, ',
          headlineAccent: 'which is nowhere.',
          pain: 'Competitors are not better than you — they are just easier to find.',
          symptoms: [
            'Traffic flat or falling for months',
            'You rank for your own name only',
            'Competitors own the terms that matter',
          ],
          primaryCta: { label: 'Get a free SEO audit', href: '/resources/freebies-audits' },
          secondaryCta: { label: 'Talk to a specialist', href: '/contact' },
        }}
        sections={[
          {
            color: 'blue',
            title: 'What this service focuses on',
            subtitle:
              'Practical SEO support that improves discoverability and search performance over time.',
            features: [
              {
                title: 'SEO Audits',
                icon: Search,
                desc: 'Identify technical issues, performance gaps, and content opportunities.',
              },
              {
                title: 'Keyword Strategy',
                icon: BarChart3,
                desc: 'Target the terms your ideal audience is already searching for.',
              },
              {
                title: 'Search Growth',
                icon: ShieldCheck,
                desc: 'Create a stronger foundation for sustained organic visibility and traffic.',
              },
            ],
          },
        ]}
      />
      <SubServiceGrid parentHref="/digital-marketing/web-growth-seo" />
    </>
  )
}
