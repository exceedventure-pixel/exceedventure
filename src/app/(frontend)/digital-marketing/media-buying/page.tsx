import type { Metadata } from 'next'
import React from 'react'
import { Megaphone, Target, ChartNoAxesCombined, ShieldCheck } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('digital-marketing/media-buying').catch(() => null)
  return generatePageMeta({
    slug: 'digital-marketing/media-buying',
    seoDoc,
    fallbackTitle: 'Media Buying',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      color="blue"
      icon={Megaphone}
      badge="Sub Service"
      titleLead="Media "
      titleAccent="Buying"
      subtitle="Reach the right audience with strategically managed paid campaigns across the right channels."
      sections={[
        {
          color: 'blue',
          title: 'How this service helps',
          subtitle:
            'Paid media support that improves audience targeting, spend efficiency, and campaign performance.',
          features: [
            {
              title: 'Audience Targeting',
              icon: Target,
              desc: 'Focus your budget on the segments that matter most to your business.',
            },
            {
              title: 'Performance Tracking',
              icon: ChartNoAxesCombined,
              desc: 'Monitor spend, engagement, and conversions with a clear reporting lens.',
            },
            {
              title: 'Campaign Reliability',
              icon: ShieldCheck,
              desc: 'Keep campaigns efficient, accountable, and aligned with your growth goals.',
            },
          ],
        },
      ]}
    />
  )
}
