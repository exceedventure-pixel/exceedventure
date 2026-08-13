import type { Metadata } from 'next'
import React from 'react'
import { Image, Printer, Zap } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('creative-branding/graphic-design/graphic-design-services').catch(
    () => null,
  )
  return generatePageMeta({
    slug: 'creative-branding/graphic-design/graphic-design-services',
    seoDoc,
    fallbackTitle: 'Graphic Design Services',
    fallbackDescription:
      'Missed design deadlines hold up launches, campaigns and print runs. The cost is never the design fee — it is everything queued behind it.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="creative-branding/graphic-design/graphic-design-services"
      color="purple"
      icon={Image}
      badge="Specialist Service"
      titleLead="Graphic Design "
      titleAccent="Services"
      subtitle="Day-to-day design support across every format you need."
      hero={{
        badge: 'Design Services',
        headline: 'Delivered when you ',
        headlineAccent: 'said you needed it.',
        pain: 'The cost of a missed design deadline is everything queued behind it.',
        symptoms: [
          'Design is the pre-launch bottleneck',
          'Briefs go back and forth for days',
          'You chase files the night before',
        ],
        primaryCta: { label: 'Get a free design quote', href: '/contact' },
        secondaryCta: { label: 'See pricing', href: '/pricing' },
      }}
      sections={[
        {
          color: 'purple',
          title: 'What this service covers',
          subtitle: 'Day-to-day design support across every format you need.',
          features: [
            {
              title: 'Social & Digital',
              icon: Image,
              desc: 'Posts, banners and ads produced to spec.',
            },
            {
              title: 'Print & Packaging',
              icon: Printer,
              desc: 'Physical pieces prepared for production.',
            },
            {
              title: 'Fast Turnaround',
              icon: Zap,
              desc: 'Short-notice work handled without dropping quality.',
            },
          ],
        },
      ]}
    />
  )
}
