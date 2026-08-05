import type { Metadata } from 'next'
import React from 'react'
import { Megaphone, TrendingUp, Users, Target, Search, BarChart3 } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('digital-marketing').catch(() => null)
  return generatePageMeta({
    slug: 'digital-marketing',
    seoDoc,
    fallbackTitle: 'Digital Marketing',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      color="blue"
      icon={Megaphone}
      badge="Growth Service"
      titleLead="Digital "
      titleAccent="Marketing"
      subtitle="Drive qualified traffic, stronger visibility, and measurable business growth across the digital funnel."
      sections={[
        {
          color: 'blue',
          title: 'What this service is for',
          subtitle:
            'Performance-led marketing services for brands that want more reach and better conversions.',
          features: [
            {
              title: 'Web Growth SEO',
              icon: TrendingUp,
              desc: 'Improve rankings, visibility, and organic traffic with a search-first strategy.',
              items: ['Audit & strategy', 'Keyword planning', 'Technical SEO improvements'],
            },
            {
              title: 'Media Buying',
              icon: Megaphone,
              desc: 'Run paid campaigns that reach the right audience at the right time.',
              items: ['Meta & Google Ads', 'Audience targeting', 'Campaign optimization'],
            },
            {
              title: 'SMM & VA',
              icon: Users,
              desc: 'Support your social presence and daily operations with reliable execution.',
              items: ['Content scheduling', 'Community management', 'Administrative support'],
            },
            {
              title: 'Niche Marketing',
              icon: Target,
              desc: 'Focused campaigns for specific industries, regions, or audience segments.',
              items: [
                'Industry targeting',
                'Location-based strategy',
                'Conversion-focused messaging',
              ],
            },
          ],
        },
        {
          color: 'emerald',
          muted: true,
          badge: 'Performance',
          title: 'Data-driven execution',
          subtitle: 'Marketing that is measurable, adaptive, and aligned with business goals.',
          features: [
            {
              title: 'Search Visibility',
              icon: Search,
              desc: 'Strengthen your brand presence where your audience is actively looking.',
            },
            {
              title: 'Campaign Reporting',
              icon: BarChart3,
              desc: 'Track the metrics that matter and turn insights into action.',
            },
          ],
        },
      ]}
    />
  )
}
