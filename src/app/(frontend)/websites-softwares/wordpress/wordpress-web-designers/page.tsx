import type { Metadata } from 'next'
import React from 'react'
import { Component, Palette, PenTool, Smartphone } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("websites-softwares/wordpress/wordpress-web-designers").catch(() => null)
  return generatePageMeta({
    slug: "websites-softwares/wordpress/wordpress-web-designers",
    seoDoc,
    fallbackTitle: "WordPress Web Designers",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        color="teal"
        icon={Palette}
        badge="Specialist Service"
        titleLead="WordPress Web "
        titleAccent="Designers"
        subtitle="Design-led WordPress builds that look sharp and stay easy for your team to run."
        sections={[
          {
            color: "teal",
            title: 'What this service covers',
            subtitle: "Design-led WordPress builds that look sharp and stay easy for your team to run.",
            features: [
              {
                title: "Custom Theme Design",
                icon: PenTool,
                desc: "Layouts designed around your content, not a stock template.",
              },
              {
                title: "Editor-Friendly Blocks",
                icon: Component,
                desc: "Reusable blocks your team can rearrange without a developer.",
              },
              {
                title: "Responsive by Default",
                icon: Smartphone,
                desc: "Checked across phone, tablet and desktop before launch.",
              },
            ],
          },
        ]}
      />
  )
}
