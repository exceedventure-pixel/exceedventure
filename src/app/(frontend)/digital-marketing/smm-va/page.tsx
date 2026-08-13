import type { Metadata } from 'next'
import React from 'react'
import { Users, MessageSquare, CalendarClock, Sparkles } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'
import { SubServiceGrid } from '@/components/SubServiceGrid'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('digital-marketing/smm-va').catch(() => null)
  return generatePageMeta({
    slug: 'digital-marketing/smm-va',
    seoDoc,
    fallbackTitle: 'SMM & VA',
    fallbackDescription:
      'Posting, replying, booking, invoicing, chasing. All of it lands on the person who should be running the business, and the important work waits its turn.',
  })
}

export default function Page() {
  return (
    <>
      <ServiceDetail
        slug="digital-marketing/smm-va"
        color="blue"
        icon={Users}
        badge="Sub Service"
        titleLead="SMM & "
        titleAccent="VA"
        subtitle="Keep your brand active and your operations moving with steady social and virtual support."
        hero={{
          badge: 'Social & Virtual Assistants',
          headline: 'Everything is on you, ',
          headlineAccent: 'and it shows.',
          pain: 'The person who should be running the business is doing the admin.',
          symptoms: [
            'Admin fills your selling hours',
            'Messages go unanswered for days',
            'You cannot take a week off',
          ],
          primaryCta: { label: 'Get a free workload review', href: '/contact' },
          secondaryCta: { label: 'See pricing', href: '/pricing' },
        }}
        sections={[
          {
            color: 'blue',
            title: 'What this service supports',
            subtitle:
              'Reliable support for daily brand consistency and operational follow-through.',
            features: [
              {
                title: 'Social Management',
                icon: MessageSquare,
                desc: 'Manage content, engagement, and community presence with consistency.',
              },
              {
                title: 'Administrative Support',
                icon: CalendarClock,
                desc: 'Cover recurring tasks that keep your team moving without friction.',
              },
              {
                title: 'Flexible Execution',
                icon: Sparkles,
                desc: 'Adapt support to the pace and needs of your business.',
              },
            ],
          },
        ]}
      />
      <SubServiceGrid parentHref="/digital-marketing/smm-va" />
    </>
  )
}
