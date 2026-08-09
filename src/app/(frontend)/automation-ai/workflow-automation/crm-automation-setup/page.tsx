import type { Metadata } from 'next'
import React from 'react'
import { Mail, Users, Workflow } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("automation-ai/workflow-automation/crm-automation-setup").catch(() => null)
  return generatePageMeta({
    slug: "automation-ai/workflow-automation/crm-automation-setup",
    seoDoc,
    fallbackTitle: "CRM Automation Setup",
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
        sections={[
          {
            color: "red",
            title: 'What this service covers',
            subtitle: "A CRM that updates itself instead of relying on someone remembering.",
            features: [
              {
                title: "Pipeline Automation",
                icon: Workflow,
                desc: "Deals move stage on the evidence, not on admin.",
              },
              {
                title: "Lead Routing",
                icon: Users,
                desc: "Every enquiry reaches the right person immediately.",
              },
              {
                title: "Follow-Up Sequences",
                icon: Mail,
                desc: "Nothing goes quiet because a reminder was missed.",
              },
            ],
          },
        ]}
      />
  )
}
