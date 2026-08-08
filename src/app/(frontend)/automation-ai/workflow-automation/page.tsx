import type { Metadata } from 'next'
import React from 'react'
import { Workflow, Zap, RefreshCcw, ShieldCheck } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'
import { SubServiceGrid } from '@/components/SubServiceGrid'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('automation-ai/workflow-automation').catch(() => null)
  return generatePageMeta({
    slug: 'automation-ai/workflow-automation',
    seoDoc,
    fallbackTitle: 'Workflow Automation',
  })
}

export default function Page() {
  return (
    <>
    <ServiceDetail
      color="red"
      icon={Workflow}
      badge="Sub Service"
      titleLead="Workflow "
      titleAccent="Automation"
      subtitle="Automate repetitive tasks and create smoother handoffs across teams and tools."
      sections={[
        {
          color: 'red',
          title: 'What this service improves',
          subtitle:
            'Operational efficiency through more consistent processes and less manual follow-up.',
          features: [
            {
              title: 'Task Automation',
              icon: Zap,
              desc: 'Remove repetitive work with automations that run reliably behind the scenes.',
            },
            {
              title: 'Process Flow',
              icon: RefreshCcw,
              desc: 'Create more consistent handoffs and clearer movement between steps.',
            },
            {
              title: 'Operational Confidence',
              icon: ShieldCheck,
              desc: 'Reduce errors and improve reliability with better process design.',
            },
          ],
        },
      ]}
    />
      <SubServiceGrid parentHref="/automation-ai/workflow-automation" />
    </>
  )
}
