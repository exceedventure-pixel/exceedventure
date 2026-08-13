import type { Metadata } from 'next'
import React from 'react'
import { ClipboardList, PenTool, Repeat, Sparkles } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO(
    'creative-branding/content-supply/content-creation-services',
  ).catch(() => null)
  return generatePageMeta({
    slug: 'creative-branding/content-supply/content-creation-services',
    seoDoc,
    fallbackTitle: 'Content Creation Services',
    fallbackDescription:
      'Most teams have a long list of things they meant to publish. What they lack is the time and the pipeline to turn that list into finished work, week after week.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="creative-branding/content-supply/content-creation-services"
      color="purple"
      icon={Sparkles}
      badge="Specialist Service"
      titleLead="Content Creation "
      titleAccent="Services"
      subtitle="A steady supply of on-brand content across the formats you need."
      hero={{
        badge: 'Content Creation',
        headline: 'You do not need ideas. ',
        headlineAccent: 'You need output.',
        pain: 'You have a list of things you meant to publish and no pipeline to make them.',
        symptoms: [
          'A backlog nobody has produced',
          'Everything waits on one busy person',
          'Quality drops when volume goes up',
        ],
        primaryCta: { label: 'Get a free content plan', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '/our-works' },
      }}
      sections={[
        {
          color: 'purple',
          title: 'What this service covers',
          subtitle: 'A steady supply of on-brand content across the formats you need.',
          features: [
            {
              title: 'Content Planning',
              icon: ClipboardList,
              desc: 'A calendar you can see a quarter ahead on.',
            },
            {
              title: 'Copy & Visuals',
              icon: PenTool,
              desc: 'Words and imagery produced together, not bolted on after.',
            },
            {
              title: 'Consistent Cadence',
              icon: Repeat,
              desc: 'Publishing that keeps its rhythm through busy months.',
            },
          ],
        },
      ]}
    />
  )
}
