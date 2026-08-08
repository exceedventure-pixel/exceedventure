import type { Metadata } from 'next'
import React from 'react'
import { Image, Printer, Zap } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("creative-branding/graphic-design/graphic-design-services").catch(() => null)
  return generatePageMeta({
    slug: "creative-branding/graphic-design/graphic-design-services",
    seoDoc,
    fallbackTitle: "Graphic Design Services",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        color="purple"
        icon={Image}
        badge="Specialist Service"
        titleLead="Graphic Design "
        titleAccent="Services"
        subtitle="Day-to-day design support across every format you need."
        sections={[
          {
            color: "purple",
            title: 'What this service covers',
            subtitle: "Day-to-day design support across every format you need.",
            features: [
              {
                title: "Social & Digital",
                icon: Image,
                desc: "Posts, banners and ads produced to spec.",
              },
              {
                title: "Print & Packaging",
                icon: Printer,
                desc: "Physical pieces prepared for production.",
              },
              {
                title: "Fast Turnaround",
                icon: Zap,
                desc: "Short-notice work handled without dropping quality.",
              },
            ],
          },
        ]}
      />
  )
}
