import type { Metadata } from 'next'
import React from 'react'
import { BookOpen, Layers, Users } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("creative-branding/brand-materials/brand-guidelines-internal-paperwork").catch(() => null)
  return generatePageMeta({
    slug: "creative-branding/brand-materials/brand-guidelines-internal-paperwork",
    seoDoc,
    fallbackTitle: "Brand Guidelines & Internal Paperwork",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        slug="creative-branding/brand-materials/brand-guidelines-internal-paperwork"
        color="purple"
        icon={BookOpen}
        badge="Specialist Service"
        titleLead="Brand Guidelines & Internal "
        titleAccent="Paperwork"
        subtitle="The rules that keep your brand consistent when you're not in the room."
        sections={[
          {
            color: "purple",
            title: 'What this service covers',
            subtitle: "The rules that keep your brand consistent when you're not in the room.",
            features: [
              {
                title: "Guideline Documents",
                icon: BookOpen,
                desc: "What to do, what not to, and why.",
              },
              {
                title: "Template Library",
                icon: Layers,
                desc: "Internal documents already set up correctly.",
              },
              {
                title: "Internal Rollout",
                icon: Users,
                desc: "Your team briefed so the rules get followed.",
              },
            ],
          },
        ]}
      />
  )
}
