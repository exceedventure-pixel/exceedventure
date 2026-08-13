import type { Metadata } from 'next'
import React from 'react'
import { Mail, Users, Workflow } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('automation-ai/workflow-automation/crm-automation-setup').catch(
    () => null,
  )
  return generatePageMeta({
    slug: 'automation-ai/workflow-automation/crm-automation-setup',
    seoDoc,
    fallbackTitle: 'CRM Automation Setup',
    fallbackDescription:
      'Enquiries arrive and nobody is quite sure who owns them. Follow-up depends on memory. By the time someone calls, the lead has booked with whoever answered first.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="automation-ai/workflow-automation/crm-automation-setup"
      color="red"
      icon={Users}
      badge="Specialist Service"
      titleLead="CRM Automation "
      titleAccent="Setup"
      subtitle="A CRM that updates itself instead of relying on someone remembering."
      hero={{
        badge: 'CRM Automation',
        headline: 'Leads go cold while your CRM ',
        headlineAccent: 'sits half-filled.',
        pain: 'Follow-up depends on memory, and memory loses to whoever called first.',
        symptoms: [
          'Enquiries are not assigned automatically',
          'Follow-ups happen when remembered',
          'Half the pipeline data is stale',
        ],
        primaryCta: { label: 'Book a free CRM review', href: '/contact' },
        secondaryCta: { label: 'See pricing', href: '/pricing' },
      }}
      sections={[
        {
          color: 'red',
          title: 'What this service covers',
          subtitle: 'A CRM that updates itself instead of relying on someone remembering.',
          features: [
            {
              title: 'Pipeline Automation',
              icon: Workflow,
              desc: 'Deals move stage on the evidence, not on admin.',
            },
            {
              title: 'Lead Routing',
              icon: Users,
              desc: 'Every enquiry reaches the right person immediately.',
            },
            {
              title: 'Follow-Up Sequences',
              icon: Mail,
              desc: 'Nothing goes quiet because a reminder was missed.',
            },
          ],
        },
      ]}
    />
  )
}
