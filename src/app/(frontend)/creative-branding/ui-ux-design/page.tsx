import type { Metadata } from 'next'
import React from 'react'
import { Monitor, MousePointer, Search } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'
import { SubServiceGrid } from '@/components/SubServiceGrid'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("creative-branding/ui-ux-design").catch(() => null)
  return generatePageMeta({
    slug: "creative-branding/ui-ux-design",
    seoDoc,
    fallbackTitle: "UI/UX Design",
  })
}

export default function Page() {
  return (
    <>
      <ServiceDetail
        slug="creative-branding/ui-ux-design"
        color="purple"
        icon={MousePointer}
        badge="Sub Service"
        titleLead="UI/UX "
        titleAccent="Design"
        subtitle="Interface and experience design that makes products obvious to use."
        sections={[
          {
            color: "purple",
            title: 'What this service covers',
            subtitle: "Interface and experience design that makes products obvious to use.",
            features: [
              {
                title: "User Research",
                icon: Search,
                desc: "Decisions grounded in what users do, not what we assume.",
              },
              {
                title: "Interface Design",
                icon: Monitor,
                desc: "Screens designed to make the next step obvious.",
              },
              {
                title: "Prototyping",
                icon: MousePointer,
                desc: "Clickable prototypes that find problems before build.",
              },
            ],
          },
        ]}
      />
      <SubServiceGrid parentHref="/creative-branding/ui-ux-design" />
    </>
  )
}
