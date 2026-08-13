import type { Metadata } from 'next'
import React from 'react'
import { Target, Compass, Megaphone, Mail, Filter, LineChart } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('solutions/marketing').catch(() => null)
  return generatePageMeta({
    slug: 'solutions/marketing',
    seoDoc,
    fallbackTitle: 'Marketing Services',
    fallbackDescription:
      'Posts published, campaigns launched, dashboards full. Then someone asks how many customers it produced, and the room goes quiet.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="solutions/marketing"
      color="amber"
      icon={Target}
      badge="Strategic Service"
      titleLead="Growth "
      titleAccent="Marketing"
      subtitle="A full-funnel marketing engine that turns strangers into customers and customers into advocates."
      hero={{
        badge: 'Growth Marketing',
        headline: 'Busy marketing ',
        headlineAccent: 'is not growth.',
        pain: 'Ask how many customers it produced and the room goes quiet.',
        symptoms: [
          'Activity measured, outcomes not',
          'Each channel runs in isolation',
          'You cannot say what a customer costs',
        ],
        primaryCta: { label: 'Get a free marketing review', href: '/contact' },
        secondaryCta: { label: 'See pricing', href: '/pricing' },
      }}
      sections={[
        {
          color: 'amber',
          title: 'What this service is for',
          subtitle:
            'Strategy, campaigns, and measurement that connect every channel to real business outcomes.',
          features: [
            {
              title: 'Marketing Strategy',
              icon: Compass,
              desc: 'Positioning, messaging, and a roadmap aligned to your revenue goals.',
            },
            {
              title: 'Campaign Management',
              icon: Megaphone,
              desc: 'End-to-end launch and management of multi-channel campaigns.',
            },
            {
              title: 'Email Marketing',
              icon: Mail,
              desc: 'Lifecycle flows and newsletters that nurture leads into sales.',
            },
            {
              title: 'Funnel Optimization',
              icon: Filter,
              desc: 'Remove friction at every stage to lift conversion and retention.',
            },
            {
              title: 'Marketing Analytics',
              icon: LineChart,
              desc: 'Attribution and dashboards that show what is actually working.',
            },
            {
              title: 'Brand Positioning',
              icon: Target,
              desc: 'Sharpen how the market sees you so the right buyers choose you.',
            },
          ],
        },
      ]}
    />
  )
}
