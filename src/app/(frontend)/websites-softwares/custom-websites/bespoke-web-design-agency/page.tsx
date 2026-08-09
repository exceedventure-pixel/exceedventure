import type { Metadata } from 'next'
import React from 'react'
import { Code2, Compass, PenTool } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("websites-softwares/custom-websites/bespoke-web-design-agency").catch(() => null)
  return generatePageMeta({
    slug: "websites-softwares/custom-websites/bespoke-web-design-agency",
    seoDoc,
    fallbackTitle: "Bespoke Web Design Agency",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        slug="websites-softwares/custom-websites/bespoke-web-design-agency"
        color="teal"
        icon={PenTool}
        badge="Specialist Service"
        titleLead="Bespoke Web Design "
        titleAccent="Agency"
        subtitle="Websites designed from scratch around your goals, not adapted from a template."
        sections={[
          {
            color: "teal",
            title: 'What this service covers',
            subtitle: "Websites designed from scratch around your goals, not adapted from a template.",
            features: [
              {
                title: "Discovery & Strategy",
                icon: Compass,
                desc: "We work out what the site has to achieve before designing it.",
              },
              {
                title: "Original Design",
                icon: PenTool,
                desc: "Every screen drawn for you rather than picked from a library.",
              },
              {
                title: "Built to Spec",
                icon: Code2,
                desc: "Developed exactly as designed, with no compromises in translation.",
              },
            ],
          },
        ]}
      />
  )
}
