import type { Metadata } from 'next'
import React from 'react'
import { ClipboardList, Headphones, Workflow, Zap } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO(
    'automation-ai/ai-integration-services/customer-support-automation',
  ).catch(() => null)
  return generatePageMeta({
    slug: 'automation-ai/ai-integration-services/customer-support-automation',
    seoDoc,
    fallbackTitle: 'Customer Support Automation',
    fallbackDescription:
      'Where is my order. How do I reset it. Can I move my booking. The same handful of questions every day, absorbing the time your team should be spending on the hard ones.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="automation-ai/ai-integration-services/customer-support-automation"
      color="red"
      icon={Headphones}
      badge="Specialist Service"
      titleLead="Customer Support "
      titleAccent="Automation"
      subtitle="Automate the repetitive half of support and route the rest properly."
      hero={{
        badge: 'Support Automation',
        headline: 'Questions you have ',
        headlineAccent: 'already answered.',
        pain: 'The same handful of questions, every day, eating your team’s week.',
        symptoms: [
          'The same questions, dozens a week',
          'First replies take hours',
          'Volume climbs every time you grow',
        ],
        primaryCta: { label: 'Book a free support review', href: '/contact' },
        secondaryCta: { label: 'See pricing', href: '/pricing' },
      }}
      sections={[
        {
          color: 'red',
          title: 'What this service covers',
          subtitle: 'Automate the repetitive half of support and route the rest properly.',
          features: [
            {
              title: 'Ticket Triage',
              icon: ClipboardList,
              desc: 'Incoming requests sorted and prioritised automatically.',
            },
            {
              title: 'Instant Answers',
              icon: Zap,
              desc: 'Common questions resolved without a queue.',
            },
            {
              title: 'Escalation Rules',
              icon: Workflow,
              desc: 'Anything sensitive reaches a person quickly.',
            },
          ],
        },
      ]}
    />
  )
}
