import type { Metadata } from 'next'
import React from 'react'
import {
  Megaphone,
  Target,
  Calendar,
  Users,
  MousePointer,
  Repeat,
  TrendingUp,
  Search,
  ThumbsUp,
  Camera,
  Music2,
  MonitorPlay,
  Briefcase,
} from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('solutions/media-buying').catch(() => null)
  return generatePageMeta({
    slug: 'solutions/media-buying',
    seoDoc,
    fallbackTitle: 'Media Buying Services',
  })
}

export default function Page() {
  return (
    <ServiceDetail
        slug="solutions/media-buying"
      color="blue"
      icon={Megaphone}
      badge="Performance Service"
      titleLead="Media "
      titleAccent="Buying"
      subtitle="Reach the right audience at the right time with paid campaigns engineered for measurable returns."
      sections={[
        {
          color: 'blue',
          title: 'What this service is for',
          subtitle:
            'Full-funnel paid advertising across search and social, managed and optimized for ROI.',
          features: [
            { title: 'Paid Advertising', icon: Target, desc: 'Strategic PPC, Meta, and Google Ads campaigns for instant, qualified traffic.' },
            { title: 'Media Planning', icon: Calendar, desc: 'Budget allocation and channel strategy mapped to your goals and seasons.' },
            { title: 'Audience Targeting', icon: Users, desc: 'Precise segmentation and lookalike modeling to reach buyers who convert.' },
            { title: 'Conversion Tracking', icon: MousePointer, desc: 'Advanced pixel tracking and event monitoring for continuous ad optimization.' },
            { title: 'Retargeting Campaigns', icon: Repeat, desc: 'Bring warm visitors back with sequenced, intent-based retargeting.' },
            { title: 'Performance Analytics', icon: TrendingUp, desc: 'Transparent reporting on ad spend, ROAS, and revenue growth.' },
          ],
        },
        {
          color: 'blue',
          muted: true,
          badge: 'Where we advertise',
          title: 'Platforms we run ads on',
          subtitle:
            'We plan, launch, and optimize campaigns across the platforms where your audience already spends its time.',
          features: [
            { title: 'Google Ads', icon: Search, desc: 'Search, Display, Shopping, and Performance Max campaigns.' },
            { title: 'Meta Ads', icon: ThumbsUp, desc: 'Facebook campaigns for reach, leads, and conversions.' },
            { title: 'Instagram Ads', icon: Camera, desc: 'Feed, Stories, and Reels ads that stop the scroll.' },
            { title: 'TikTok Ads', icon: Music2, desc: 'Native short-form video ads built for the For You feed.' },
            { title: 'YouTube Ads', icon: MonitorPlay, desc: 'In-stream and Shorts video ads that drive awareness and action.' },
            { title: 'LinkedIn Ads', icon: Briefcase, desc: 'B2B targeting by role, industry, and company.' },
          ],
        },
      ]}
    />
  )
}
