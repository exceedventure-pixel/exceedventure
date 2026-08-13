import type { Metadata } from 'next'
import React from 'react'
import { Target, MapPin, Building2, Sparkles } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'
import { SubServiceGrid } from '@/components/SubServiceGrid'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('digital-marketing/niche-marketing').catch(() => null)
  return generatePageMeta({
    slug: 'digital-marketing/niche-marketing',
    seoDoc,
    fallbackTitle: 'Niche Marketing',
    fallbackDescription:
      'Agencies that work across every sector run the same playbook everywhere. In a specialist market that means competing on volume against people who understand your buyer better than you do.',
  })
}

export default function Page() {
  return (
    <>
      <ServiceDetail
        slug="digital-marketing/niche-marketing"
        color="blue"
        icon={Target}
        badge="Sub Service"
        titleLead="Niche "
        titleAccent="Marketing"
        subtitle="Target the right market with focused messaging built around industries, locations, and audience needs."
        hero={{
          badge: 'Niche Marketing',
          headline: 'Generic marketing for a ',
          headlineAccent: 'specific business.',
          pain: 'The same playbook everywhere loses to people who know your buyer.',
          symptoms: [
            'Your agency does not know your industry',
            'Campaigns ignore how customers buy',
            'You are priced against national brands',
          ],
          primaryCta: { label: 'Get a free marketing review', href: '/contact' },
          secondaryCta: { label: 'See pricing', href: '/pricing' },
        }}
        sections={[
          {
            color: 'blue',
            title: 'Why niche targeting matters',
            subtitle: 'Strong results often come from being precise rather than broad.',
            features: [
              {
                title: 'Industry Focus',
                icon: Building2,
                desc: 'Tailor your approach to the realities and expectations of your niche.',
              },
              {
                title: 'Location-Based Strategy',
                icon: MapPin,
                desc: 'Support local visibility and audience relevance with better targeting.',
              },
              {
                title: 'Clearer Messaging',
                icon: Sparkles,
                desc: 'Make your offer resonate more strongly with a defined audience segment.',
              },
            ],
          },
        ]}
      />
      <SubServiceGrid parentHref="/digital-marketing/niche-marketing" />
    </>
  )
}
