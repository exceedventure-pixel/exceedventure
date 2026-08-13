import type { Metadata } from 'next'
import React from 'react'
import { Compass, MousePointer, Search, Users } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO(
    'creative-branding/ui-ux-design/user-experience-design-services',
  ).catch(() => null)
  return generatePageMeta({
    slug: 'creative-branding/ui-ux-design/user-experience-design-services',
    seoDoc,
    fallbackTitle: 'User Experience Design Services',
    fallbackDescription:
      'One unnecessary field, one unclear label, one badly timed prompt. Individually they look trivial. Together they are the reason your funnel leaks.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="creative-branding/ui-ux-design/user-experience-design-services"
      color="purple"
      icon={Users}
      badge="Specialist Service"
      titleLead="User Experience Design "
      titleAccent="Services"
      subtitle="Research-led UX that removes friction before it ever reaches your users."
      hero={{
        badge: 'UX Design',
        headline: 'Every extra step ',
        headlineAccent: 'costs you customers.',
        pain: 'Each unnecessary field looks trivial — together they are why the funnel leaks.',
        symptoms: [
          'More steps than the job needs',
          'Users abandon mid-form',
          'Mobile is harder than desktop',
        ],
        primaryCta: { label: 'Get a free UX review', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '/our-works' },
      }}
      sections={[
        {
          color: 'purple',
          title: 'What this service covers',
          subtitle: 'Research-led UX that removes friction before it ever reaches your users.',
          features: [
            {
              title: 'User Research',
              icon: Search,
              desc: 'Interviews and testing that show where people struggle.',
            },
            {
              title: 'Journey Mapping',
              icon: Compass,
              desc: 'The whole route mapped, not just individual screens.',
            },
            {
              title: 'Usability Testing',
              icon: MousePointer,
              desc: 'Designs tested with real people before they ship.',
            },
          ],
        },
      ]}
    />
  )
}
