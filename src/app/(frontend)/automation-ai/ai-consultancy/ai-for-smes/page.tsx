import type { Metadata } from 'next'
import React from 'react'
import { Building2, Users, Wrench, Zap } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("automation-ai/ai-consultancy/ai-for-smes").catch(() => null)
  return generatePageMeta({
    slug: "automation-ai/ai-consultancy/ai-for-smes",
    seoDoc,
    fallbackTitle: "AI for SMEs",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        color="red"
        icon={Building2}
        badge="Specialist Service"
        titleLead="AI for "
        titleAccent="SMEs"
        subtitle="Practical AI for smaller teams, sized to a real budget."
        sections={[
          {
            color: "red",
            title: 'What this service covers',
            subtitle: "Practical AI for smaller teams, sized to a real budget.",
            features: [
              {
                title: "Right-Sized Tools",
                icon: Wrench,
                desc: "Tools that fit a small team, not an enterprise licence.",
              },
              {
                title: "Quick Wins First",
                icon: Zap,
                desc: "Start where the payback arrives in weeks.",
              },
              {
                title: "Team Training",
                icon: Users,
                desc: "Your people confident using it after we leave.",
              },
            ],
          },
        ]}
      />
  )
}
