import type { Metadata } from 'next'
import React from 'react'
import { Kanban, Users, Workflow } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("websites-softwares/custom-web-systems/kanban-team-management-dashboards").catch(() => null)
  return generatePageMeta({
    slug: "websites-softwares/custom-web-systems/kanban-team-management-dashboards",
    seoDoc,
    fallbackTitle: "Kanban & Team Management Dashboards",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        slug="websites-softwares/custom-web-systems/kanban-team-management-dashboards"
        color="teal"
        icon={Kanban}
        badge="Specialist Service"
        titleLead="Kanban & Team Management "
        titleAccent="Dashboards"
        subtitle="Internal boards and dashboards that give a team one shared view of the work."
        sections={[
          {
            color: "teal",
            title: 'What this service covers',
            subtitle: "Internal boards and dashboards that give a team one shared view of the work.",
            features: [
              {
                title: "Kanban Boards",
                icon: Kanban,
                desc: "Work visible at a glance, with stages that match your process.",
              },
              {
                title: "Team Visibility",
                icon: Users,
                desc: "Who is doing what, without another status meeting.",
              },
              {
                title: "Custom Workflows",
                icon: Workflow,
                desc: "Stages, rules and handoffs configured to your process.",
              },
            ],
          },
        ]}
      />
  )
}
