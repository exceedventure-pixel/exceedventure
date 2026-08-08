import type { Metadata } from 'next'
import React from 'react'
import { Brush, Image, Layers, Printer } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'
import { SubServiceGrid } from '@/components/SubServiceGrid'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("creative-branding/graphic-design").catch(() => null)
  return generatePageMeta({
    slug: "creative-branding/graphic-design",
    seoDoc,
    fallbackTitle: "Graphic Design",
  })
}

export default function Page() {
  return (
    <>
      <ServiceDetail
        color="purple"
        icon={Brush}
        badge="Sub Service"
        titleLead="Graphic "
        titleAccent="Design"
        subtitle="Graphic design across digital and print, delivered on brief."
        sections={[
          {
            color: "purple",
            title: 'What this service covers',
            subtitle: "Graphic design across digital and print, delivered on brief.",
            features: [
              {
                title: "Digital Graphics",
                icon: Image,
                desc: "Assets sized and built for every platform you post to.",
              },
              {
                title: "Print Design",
                icon: Printer,
                desc: "Artwork prepared properly for the press.",
              },
              {
                title: "Campaign Assets",
                icon: Layers,
                desc: "Full sets that stay consistent across every placement.",
              },
            ],
          },
        ]}
      />
      <SubServiceGrid parentHref="/creative-branding/graphic-design" />
    </>
  )
}
