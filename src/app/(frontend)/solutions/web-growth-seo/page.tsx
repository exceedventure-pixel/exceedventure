import type { Metadata } from 'next'
import React from 'react'
import { TrendingUp, Search, Wrench, Globe, FileText, Target, BarChart3 } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('solutions/web-growth-seo').catch(() => null)
  return generatePageMeta({
    slug: 'solutions/web-growth-seo',
    seoDoc,
    fallbackTitle: 'Web Growth (SEO) Services',
  })
}

export default function Page() {
  return (
    <ServiceDetail
        slug="solutions/web-growth-seo"
      color="emerald"
      icon={TrendingUp}
      badge="Growth Service"
      titleLead="Web Growth "
      titleAccent="(SEO)"
      subtitle="Earn compounding organic traffic with data-driven SEO that lifts your rankings and keeps them there."
      sections={[
        {
          color: 'emerald',
          title: 'What this service is for',
          subtitle:
            'Sustainable organic growth built on technical health, authority, and content that ranks.',
          features: [
            { title: 'SEO Strategy', icon: Search, desc: 'Comprehensive keyword research and on-page optimization for higher rankings.' },
            { title: 'Technical SEO', icon: Wrench, desc: 'Site speed, crawlability, and structured data fixes that unlock rankings.' },
            { title: 'Link Building', icon: Globe, desc: 'High-quality backlink acquisition to boost domain authority and trust.' },
            { title: 'Content Optimization', icon: FileText, desc: 'SEO-friendly content restructuring to improve search visibility.' },
            { title: 'Keyword Research', icon: Target, desc: 'Intent-mapped keyword targeting that captures buyers, not just clicks.' },
            { title: 'Analytics & Reporting', icon: BarChart3, desc: 'Detailed reporting on traffic, rankings, and organic revenue growth.' },
          ],
        },
      ]}
    />
  )
}
