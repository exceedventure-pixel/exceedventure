import type { Metadata } from 'next'
import React from 'react'
import { Sparkles, PlugZap, Workflow, ShieldCheck } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'
import { SubServiceGrid } from '@/components/SubServiceGrid'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('automation-ai/ai-integration-services').catch(() => null)
  return generatePageMeta({
    slug: 'automation-ai/ai-integration-services',
    seoDoc,
    fallbackTitle: 'AI Integration Services',
  })
}

export default function Page() {
  return (
    <>
    <ServiceDetail
        slug="automation-ai/ai-integration-services"
      color="red"
      icon={Sparkles}
      badge="Sub Service"
      titleLead="AI Integration "
      titleAccent="Services"
      subtitle="Connect AI tools into your existing systems so they actually support daily work."
      sections={[
        {
          color: 'red',
          title: 'How this service helps',
          subtitle: 'Practical integrations that make AI useful in your business operations.',
          features: [
            {
              title: 'Tool Integration',
              icon: PlugZap,
              desc: 'Connect AI tools to your current stack without unnecessary complexity.',
            },
            {
              title: 'Workflow Setup',
              icon: Workflow,
              desc: 'Create reliable processes so the technology fits how your team works.',
            },
            {
              title: 'Reliable Adoption',
              icon: ShieldCheck,
              desc: 'Make sure the implementation is useful, stable, and easy for teams to use.',
            },
          ],
        },
      ]}
    />
      <SubServiceGrid parentHref="/automation-ai/ai-integration-services" />
    </>
  )
}
