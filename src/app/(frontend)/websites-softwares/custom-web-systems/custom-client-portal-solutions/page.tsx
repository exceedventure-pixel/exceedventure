import type { Metadata } from 'next'
import React from 'react'
import { FileText, LayoutDashboard, ShieldCheck, Users } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("websites-softwares/custom-web-systems/custom-client-portal-solutions").catch(() => null)
  return generatePageMeta({
    slug: "websites-softwares/custom-web-systems/custom-client-portal-solutions",
    seoDoc,
    fallbackTitle: "Custom Client Portal Solutions",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        slug="websites-softwares/custom-web-systems/custom-client-portal-solutions"
        color="teal"
        icon={Users}
        badge="Specialist Service"
        titleLead="Custom Client Portal "
        titleAccent="Solutions"
        subtitle="Private portals where clients track progress, approve work and reach their files."
        sections={[
          {
            color: "teal",
            title: 'What this service covers',
            subtitle: "Private portals where clients track progress, approve work and reach their files.",
            features: [
              {
                title: "Secure Access",
                icon: ShieldCheck,
                desc: "Each client sees their own work and nothing else.",
              },
              {
                title: "Project Visibility",
                icon: LayoutDashboard,
                desc: "Progress clients can check without emailing you.",
              },
              {
                title: "Files & Approvals",
                icon: FileText,
                desc: "Deliverables and sign-off in one place, on the record.",
              },
            ],
          },
        ]}
      />
  )
}
