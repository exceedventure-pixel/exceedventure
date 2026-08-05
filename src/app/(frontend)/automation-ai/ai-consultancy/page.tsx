import type { Metadata } from 'next'
import React from 'react'
import { Cpu, Lightbulb, Compass, ShieldCheck } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('automation-ai/ai-consultancy').catch(() => null)
  return generatePageMeta({
    slug: 'automation-ai/ai-consultancy',
    seoDoc,
    fallbackTitle: 'AI Consultancy',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      color="red"
      icon={Cpu}
      badge="Sub Service"
      titleLead="AI "
      titleAccent="Consultancy"
      subtitle="Get practical guidance on where AI can remove friction, improve output, and create business value."
      sections={[
        {
          color: 'red',
          title: 'Why this service matters',
          subtitle:
            'The right AI strategy helps businesses act with clarity instead of experimentation alone.',
          features: [
            {
              title: 'Opportunity Mapping',
              icon: Lightbulb,
              desc: 'Identify the strongest areas for AI adoption based on your business goals.',
            },
            {
              title: 'Strategic Guidance',
              icon: Compass,
              desc: 'Create a realistic roadmap for implementation, adoption, and results.',
            },
            {
              title: 'Confident Execution',
              icon: ShieldCheck,
              desc: 'Move forward with a practical plan that balances ambition and risk.',
            },
          ],
        },
      ]}
    />
  )
}
