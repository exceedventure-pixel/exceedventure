import type { Metadata } from 'next'
import React from 'react'
import { Database, MessageSquare, Plug, Users } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("automation-ai/ai-integration-services/chatbot-integration").catch(() => null)
  return generatePageMeta({
    slug: "automation-ai/ai-integration-services/chatbot-integration",
    seoDoc,
    fallbackTitle: "Chatbot Integration",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        slug="automation-ai/ai-integration-services/chatbot-integration"
        color="red"
        icon={MessageSquare}
        badge="Specialist Service"
        titleLead="Chatbot "
        titleAccent="Integration"
        subtitle="Assistants that answer real questions using your own content."
        sections={[
          {
            color: "red",
            title: 'What this service covers',
            subtitle: "Assistants that answer real questions using your own content.",
            features: [
              {
                title: "Trained on Your Content",
                icon: Database,
                desc: "Answers drawn from your documentation, not guesswork.",
              },
              {
                title: "Site & Channel Setup",
                icon: Plug,
                desc: "Live on your site and the channels your customers use.",
              },
              {
                title: "Handover to Humans",
                icon: Users,
                desc: "Clean escalation the moment it is out of its depth.",
              },
            ],
          },
        ]}
      />
  )
}
