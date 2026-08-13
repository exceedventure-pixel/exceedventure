import type { Metadata } from 'next'
import React from 'react'
import { CalendarCheck, Dumbbell, Target, TrendingUp } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO(
    'digital-marketing/niche-marketing/fitness-marketing-agency',
  ).catch(() => null)
  return generatePageMeta({
    slug: 'digital-marketing/niche-marketing/fitness-marketing-agency',
    seoDoc,
    fallbackTitle: 'Fitness Marketing Agency',
    fallbackDescription:
      'A January rush means nothing if half of them are gone by March. Most gym marketing spends everything on acquisition and almost nothing on keeping people.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="digital-marketing/niche-marketing/fitness-marketing-agency"
      color="blue"
      icon={Dumbbell}
      badge="Specialist Service"
      titleLead="Fitness Marketing "
      titleAccent="Agency"
      subtitle="Marketing for gyms, studios and coaches who need a full timetable."
      hero={{
        badge: 'Fitness Marketing',
        headline: 'Sign-ups are easy. ',
        headlineAccent: 'Retention pays the rent.',
        pain: 'A January rush means nothing if half of them are gone by March.',
        symptoms: [
          'Members churn in three months',
          'Marketing stops once they join',
          'Trials do not become memberships',
        ],
        primaryCta: { label: 'Get a free membership review', href: '/contact' },
        secondaryCta: { label: 'See pricing', href: '/pricing' },
      }}
      sections={[
        {
          color: 'blue',
          title: 'What this service covers',
          subtitle: 'Marketing for gyms, studios and coaches who need a full timetable.',
          features: [
            {
              title: 'Membership Growth',
              icon: TrendingUp,
              desc: 'Campaigns aimed at joins and retention, not just followers.',
            },
            {
              title: 'Class & Timetable Promotion',
              icon: CalendarCheck,
              desc: 'Quiet slots filled and new classes launched.',
            },
            {
              title: 'Local Reach',
              icon: Target,
              desc: 'Found by the people who live near enough to turn up.',
            },
          ],
        },
      ]}
    />
  )
}
