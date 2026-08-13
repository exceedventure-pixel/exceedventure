import type { Metadata } from 'next'
import React from 'react'
import { Bot, Cpu, Workflow, Sparkles, Settings, Zap } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('automation-ai').catch(() => null)
  return generatePageMeta({
    slug: 'automation-ai',
    seoDoc,
    fallbackTitle: 'Automation & AI',
    fallbackDescription:
      'Copying data between systems, chasing the same updates, retyping the same replies. None of it shows up on a P&L, and all of it is eating days every month.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="automation-ai"
      color="red"
      icon={Bot}
      badge="Innovation Service"
      titleLead="Automation & "
      titleAccent="AI"
      subtitle="Use intelligent systems to reduce manual work, speed up execution, and make operations smarter."
      hero={{
        badge: 'Automation & AI',
        headline: 'Stop doing work a ',
        headlineAccent: 'computer should do.',
        pain: 'Copying data, chasing updates, retyping replies — days a month, gone.',
        symptoms: [
          'The same data typed into three tools',
          'Work stalls waiting on a handoff',
          'You cannot hire your way out of admin',
        ],
        primaryCta: { label: 'Book a free automation review', href: '/contact' },
        secondaryCta: { label: 'See pricing', href: '/pricing' },
      }}
      sections={[
        {
          color: 'red',
          title: 'What this service is for',
          subtitle: 'Automation and AI support for founders, teams, and growing businesses.',
          features: [
            {
              title: 'AI Consultancy',
              icon: Cpu,
              desc: 'Get clear guidance on where AI can create value in your business.',
              items: ['Opportunity mapping', 'Use-case strategy', 'Practical recommendations'],
            },
            {
              title: 'AI Integration Services',
              icon: Sparkles,
              desc: 'Connect AI tools into the systems you already use.',
              items: ['Tool integration', 'Workflow setup', 'Operational adoption'],
            },
            {
              title: 'Workflow Automation',
              icon: Workflow,
              desc: 'Eliminate repetitive tasks with reliable automations and orchestrated processes.',
              items: ['Task automations', 'Approval flows', 'Process handoffs'],
            },
          ],
        },
        {
          color: 'amber',
          muted: true,
          badge: 'Operational Impact',
          title: 'Fewer bottlenecks, more momentum',
          subtitle:
            'Automation helps teams focus on strategy while technology handles repetitive work.',
          features: [
            {
              title: 'Smarter Systems',
              icon: Settings,
              desc: 'Create a more efficient operating model with the right workflows in place.',
            },
            {
              title: 'Speed & Reliability',
              icon: Zap,
              desc: 'Automate handoffs and reduce delays across teams and tools.',
            },
          ],
        },
      ]}
    />
  )
}
