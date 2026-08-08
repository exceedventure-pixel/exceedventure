import type { Metadata } from 'next'
import React from 'react'
import { Database, Layers, Server } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("websites-softwares/custom-web-systems/headless-payload-cms-architectures").catch(() => null)
  return generatePageMeta({
    slug: "websites-softwares/custom-web-systems/headless-payload-cms-architectures",
    seoDoc,
    fallbackTitle: "Headless Payload CMS Architectures",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        color="teal"
        icon={Database}
        badge="Specialist Service"
        titleLead="Headless Payload CMS "
        titleAccent="Architectures"
        subtitle="Headless Payload CMS setups that separate content from how it gets presented."
        sections={[
          {
            color: "teal",
            title: 'What this service covers',
            subtitle: "Headless Payload CMS setups that separate content from how it gets presented.",
            features: [
              {
                title: "Payload CMS Builds",
                icon: Database,
                desc: "A CMS modelled on your content, not the other way round.",
              },
              {
                title: "Custom Collections",
                icon: Layers,
                desc: "Structures and relationships that match how you actually work.",
              },
              {
                title: "API-First Delivery",
                icon: Server,
                desc: "Content available to any front-end, site or app.",
              },
            ],
          },
        ]}
      />
  )
}
