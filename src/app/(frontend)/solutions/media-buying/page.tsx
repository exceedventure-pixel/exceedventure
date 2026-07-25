import type { Metadata } from 'next'
import React from 'react'
import { Megaphone, Search, FileText, Target, TrendingUp, Globe, MousePointer } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('services/media-buying-seo').catch(() => null)
  return generatePageMeta({
    slug: 'services/media-buying-seo',
    seoDoc,
    fallbackTitle: 'Media Buying & SEO Services',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      color="blue"
      icon={Megaphone}
      badge="Performance Service"
      titleLead="Media Buying & "
      titleAccent="SEO Services"
      subtitle="Boost your visibility with strategic media buying and data-driven SEO optimization."
      sections={[
        {
          color: 'blue',
          title: 'What this service is for',
          subtitle:
            'Comprehensive marketing and SEO solutions designed to scale your business and dominate search results.',
          features: [
            { title: 'SEO Strategy', icon: Search, desc: 'Comprehensive keyword research and on-page optimization for higher rankings.' },
            { title: 'Link Building', icon: Globe, desc: 'High-quality backlink acquisition to boost domain authority and trust.' },
            { title: 'Content Optimization', icon: FileText, desc: 'SEO-friendly content restructuring to improve search visibility.' },
            { title: 'Paid Advertising', icon: Target, desc: 'Strategic PPC, Meta, and Google Ads campaigns for instant traffic.' },
            { title: 'Conversion Tracking', icon: MousePointer, desc: 'Advanced pixel tracking and event monitoring for ad optimization.' },
            { title: 'Performance Analytics', icon: TrendingUp, desc: 'Detailed reporting on traffic, rankings, and ROI growth.' },
          ],
        },
      ]}
    />
  )
}
