import type { Metadata } from 'next'
import React from 'react'
import { CreditCard, Facebook, PenTool, Target } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('digital-marketing/media-buying/facebook-ads-agency-uk').catch(
    () => null,
  )
  return generatePageMeta({
    slug: 'digital-marketing/media-buying/facebook-ads-agency-uk',
    seoDoc,
    fallbackTitle: 'Facebook Ads Agency UK',
    fallbackDescription:
      'Broad targeting burns budget on an audience that was never going to buy. Cheap reach stops being cheap the moment none of it converts.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="digital-marketing/media-buying/facebook-ads-agency-uk"
      color="blue"
      icon={Facebook}
      badge="Specialist Service"
      titleLead="Facebook Ads Agency "
      titleAccent="UK"
      subtitle="UK-focused Facebook and Instagram buying with local audience insight."
      hero={{
        badge: 'Facebook Ads · UK',
        headline: 'Reach buyers, ',
        headlineAccent: 'not just people.',
        pain: 'Cheap reach stops being cheap the moment none of it converts.',
        symptoms: [
          'Cheap clicks, almost no enquiries',
          'Audiences unchanged for months',
          'You cannot tie an ad to a sale',
        ],
        primaryCta: { label: 'Get a free ad account review', href: '/contact' },
        secondaryCta: { label: 'See pricing', href: '/pricing' },
      }}
      sections={[
        {
          color: 'blue',
          title: 'What this service covers',
          subtitle: 'UK-focused Facebook and Instagram buying with local audience insight.',
          features: [
            {
              title: 'UK Audience Targeting',
              icon: Target,
              desc: 'Audiences built for UK regions, seasons and buying habits.',
            },
            {
              title: 'Creative & Copy',
              icon: PenTool,
              desc: 'Ads written and designed for the market you sell into.',
            },
            {
              title: 'Budget Management',
              icon: CreditCard,
              desc: 'Spend managed daily so nothing runs away unnoticed.',
            },
          ],
        },
      ]}
    />
  )
}
