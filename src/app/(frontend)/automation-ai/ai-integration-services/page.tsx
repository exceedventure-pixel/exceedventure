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
    fallbackDescription:
      'A chatbot in a browser tab helps nobody. The value shows up when AI can read your data, write into your tools, and run without someone babysitting it.',
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
        hero={{
          badge: 'AI Integration',
          headline: 'AI only helps once it is ',
          headlineAccent: 'inside your systems.',
          pain: 'A chatbot in a browser tab helps nobody.',
          symptoms: [
            'Staff copy answers across by hand',
            'The AI cannot see your own data',
            'Nothing connects to your CRM',
          ],
          primaryCta: { label: 'Book a free integration review', href: '/contact' },
          secondaryCta: { label: 'See pricing', href: '/pricing' },
        }}
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
