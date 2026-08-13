import type { Metadata } from 'next'
import React from 'react'
import { Database, MessageSquare, Plug, Users } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO(
    'automation-ai/ai-integration-services/chatbot-integration',
  ).catch(() => null)
  return generatePageMeta({
    slug: 'automation-ai/ai-integration-services/chatbot-integration',
    seoDoc,
    fallbackTitle: 'Chatbot Integration',
    fallbackDescription:
      'Most bots exist to stop people reaching you. That is why customers hammer the "talk to a human" button within seconds, and why your inbox is no lighter than it was.',
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
      hero={{
        badge: 'Chatbot Integration',
        headline: 'A chatbot that answers, ',
        headlineAccent: 'not deflects.',
        pain: 'Most bots exist to stop people reaching you, and everyone can tell.',
        symptoms: [
          'It replies with links, not answers',
          'Customers escalate within seconds',
          'It knows nothing about their order',
        ],
        primaryCta: { label: 'Book a free chatbot review', href: '/contact' },
        secondaryCta: { label: 'See pricing', href: '/pricing' },
      }}
      sections={[
        {
          color: 'red',
          title: 'What this service covers',
          subtitle: 'Assistants that answer real questions using your own content.',
          features: [
            {
              title: 'Trained on Your Content',
              icon: Database,
              desc: 'Answers drawn from your documentation, not guesswork.',
            },
            {
              title: 'Site & Channel Setup',
              icon: Plug,
              desc: 'Live on your site and the channels your customers use.',
            },
            {
              title: 'Handover to Humans',
              icon: Users,
              desc: 'Clean escalation the moment it is out of its depth.',
            },
          ],
        },
      ]}
    />
  )
}
