import type { Metadata } from 'next'
import React from 'react'
import { ClipboardList, Plug, Repeat, Workflow } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("automation-ai/workflow-automation/internal-process-automation").catch(() => null)
  return generatePageMeta({
    slug: "automation-ai/workflow-automation/internal-process-automation",
    seoDoc,
    fallbackTitle: "Internal Process Automation",
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
        sections={[
          {
            color: "red",
            title: 'What this service covers',
            subtitle: "Connect the tools you already use so work moves without copy-paste.",
            features: [
              {
                title: "Tool-to-Tool Sync",
                icon: Plug,
                desc: "Systems kept in step without anyone rekeying data.",
              },
              {
                title: "Approval Flows",
                icon: ClipboardList,
                desc: "Sign-off routed, tracked and recorded.",
              },
              {
                title: "Scheduled Jobs",
                icon: Repeat,
                desc: "Recurring work that simply happens on time.",
              },
            ],
          },
        ]}
      />
  )
}
