import type { Metadata } from 'next'
import React from 'react'
import { Compass, MousePointer, Search, Users } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("creative-branding/ui-ux-design/user-experience-design-services").catch(() => null)
  return generatePageMeta({
    slug: "creative-branding/ui-ux-design/user-experience-design-services",
    seoDoc,
    fallbackTitle: "User Experience Design Services",
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
        sections={[
          {
            color: "purple",
            title: 'What this service covers',
            subtitle: "Research-led UX that removes friction before it ever reaches your users.",
            features: [
              {
                title: "User Research",
                icon: Search,
                desc: "Interviews and testing that show where people struggle.",
              },
              {
                title: "Journey Mapping",
                icon: Compass,
                desc: "The whole route mapped, not just individual screens.",
              },
              {
                title: "Usability Testing",
                icon: MousePointer,
                desc: "Designs tested with real people before they ship.",
              },
            ],
          },
        ]}
      />
  )
}
