import type { Metadata } from 'next'
import React from 'react'
import { ClipboardList, Plug, Repeat, Workflow } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO(
    'automation-ai/workflow-automation/internal-process-automation',
  ).catch(() => null)
  return generatePageMeta({
    slug: 'automation-ai/workflow-automation/internal-process-automation',
    seoDoc,
    fallbackTitle: 'Internal Process Automation',
    fallbackDescription:
      'Onboarding, approvals, reporting, timesheets — the work between the work. It never gets prioritised because it is nobody’s job, and it never stops either.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="automation-ai/workflow-automation/internal-process-automation"
      color="red"
      icon={Workflow}
      badge="Specialist Service"
      titleLead="Internal Process "
      titleAccent="Automation"
      subtitle="Connect the tools you already use so work moves without copy-paste."
      hero={{
        badge: 'Process Automation',
        headline: 'The admin nobody owns ',
        headlineAccent: 'costs you days.',
        pain: 'Onboarding, approvals, reporting — the work between the work.',
        symptoms: [
          'Onboarding is a manual checklist',
          'Approvals stall in email threads',
          'Monthly reporting eats a day',
        ],
        primaryCta: { label: 'Book a free process review', href: '/contact' },
        secondaryCta: { label: 'See pricing', href: '/pricing' },
      }}
      sections={[
        {
          color: 'red',
          title: 'What this service covers',
          subtitle: 'Connect the tools you already use so work moves without copy-paste.',
          features: [
            {
              title: 'Tool-to-Tool Sync',
              icon: Plug,
              desc: 'Systems kept in step without anyone rekeying data.',
            },
            {
              title: 'Approval Flows',
              icon: ClipboardList,
              desc: 'Sign-off routed, tracked and recorded.',
            },
            {
              title: 'Scheduled Jobs',
              icon: Repeat,
              desc: 'Recurring work that simply happens on time.',
            },
          ],
        },
      ]}
    />
  )
}
