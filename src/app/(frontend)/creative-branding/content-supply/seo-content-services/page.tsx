import type { Metadata } from 'next'
import React from 'react'
import { FileText, PenTool, Search, TrendingUp } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('creative-branding/content-supply/seo-content-services').catch(
    () => null,
  )
  return generatePageMeta({
    slug: 'creative-branding/content-supply/seo-content-services',
    seoDoc,
    fallbackTitle: 'SEO Content Services',
    fallbackDescription:
      'Publishing on instinct means competing for terms nobody types, or terms you were never going to win. Search-led content starts from demand that already exists.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="creative-branding/content-supply/seo-content-services"
      color="purple"
      icon={FileText}
      badge="Specialist Service"
      titleLead="SEO Content "
      titleAccent="Services"
      subtitle="Content written to rank and still worth reading."
      hero={{
        badge: 'SEO Content',
        headline: 'Content nobody searches for ',
        headlineAccent: 'is never found.',
        pain: 'Publishing on instinct means competing for terms nobody types.',
        symptoms: [
          'You publish often and rank for nothing',
          'Nobody checked demand before writing',
          'Older posts get no traffic',
        ],
        primaryCta: { label: 'Get a free content audit', href: '/resources/freebies-audits' },
        secondaryCta: { label: 'Talk to a specialist', href: '/contact' },
      }}
      sections={[
        {
          color: 'purple',
          title: 'What this service covers',
          subtitle: 'Content written to rank and still worth reading.',
          features: [
            {
              title: 'Keyword-Led Briefs',
              icon: Search,
              desc: 'Every piece aimed at a search someone actually makes.',
            },
            {
              title: 'Written by Specialists',
              icon: PenTool,
              desc: 'Writers who understand the subject, not just the keyword.',
            },
            {
              title: 'Optimised on Publish',
              icon: TrendingUp,
              desc: 'Structure, links and metadata handled before it goes live.',
            },
          ],
        },
      ]}
    />
  )
}
