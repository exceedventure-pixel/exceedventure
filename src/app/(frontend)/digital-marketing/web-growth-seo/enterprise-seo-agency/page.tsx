import type { Metadata } from 'next'
import React from 'react'
import { BarChart3, Building2, ClipboardList, Layers } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("digital-marketing/web-growth-seo/enterprise-seo-agency").catch(() => null)
  return generatePageMeta({
    slug: "digital-marketing/web-growth-seo/enterprise-seo-agency",
    seoDoc,
    fallbackTitle: "Enterprise SEO Agency",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        slug="digital-marketing/web-growth-seo/enterprise-seo-agency"
        color="blue"
        icon={Building2}
        badge="Specialist Service"
        titleLead="Enterprise SEO "
        titleAccent="Agency"
        subtitle="SEO for large sites where scale, governance and stakeholders all matter."
        sections={[
          {
            color: "blue",
            title: 'What this service covers',
            subtitle: "SEO for large sites where scale, governance and stakeholders all matter.",
            features: [
              {
                title: "Large-Site Architecture",
                icon: Layers,
                desc: "Structure and internal linking handled at thousands of pages.",
              },
              {
                title: "Governance & Process",
                icon: ClipboardList,
                desc: "Change control that survives multiple teams.",
              },
              {
                title: "Stakeholder Reporting",
                icon: BarChart3,
                desc: "Reporting that answers what the board actually asks.",
              },
            ],
          },
        ]}
      />
  )
}
