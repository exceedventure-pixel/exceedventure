import type { Metadata } from 'next'
import React from 'react'
import { CalendarCheck, Dumbbell, Target, TrendingUp } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("digital-marketing/niche-marketing/fitness-marketing-agency").catch(() => null)
  return generatePageMeta({
    slug: "digital-marketing/niche-marketing/fitness-marketing-agency",
    seoDoc,
    fallbackTitle: "Fitness Marketing Agency",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        color="blue"
        icon={Dumbbell}
        badge="Specialist Service"
        titleLead="Fitness Marketing "
        titleAccent="Agency"
        subtitle="Marketing for gyms, studios and coaches who need a full timetable."
        sections={[
          {
            color: "blue",
            title: 'What this service covers',
            subtitle: "Marketing for gyms, studios and coaches who need a full timetable.",
            features: [
              {
                title: "Membership Growth",
                icon: TrendingUp,
                desc: "Campaigns aimed at joins and retention, not just followers.",
              },
              {
                title: "Class & Timetable Promotion",
                icon: CalendarCheck,
                desc: "Quiet slots filled and new classes launched.",
              },
              {
                title: "Local Reach",
                icon: Target,
                desc: "Found by the people who live near enough to turn up.",
              },
            ],
          },
        ]}
      />
  )
}
