import type { Metadata } from 'next'
import React from 'react'
import { Bot, Workflow, Cpu, Settings, Layers, Users, Zap } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('services/automation-ai').catch(() => null)
  return generatePageMeta({
    slug: 'services/automation-ai',
    seoDoc,
    fallbackTitle: 'Automation & AI Integration',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      color="red"
      icon={Bot}
      badge="Core & Strategic Service"
      titleLead="Automation & "
      titleAccent="AI Integration"
      subtitle="Make businesses run smarter with AI."
      sections={[
        {
          color: 'red',
          title: 'What this service is for',
          subtitle: 'Intelligent automation and AI solutions to streamline your business operations.',
          features: [
            { title: 'AI Integration', icon: Cpu, desc: 'Seamlessly integrate AI into your existing workflows.' },
            { title: 'Task Automation', icon: Zap, desc: 'Automate repetitive tasks using AI and software.' },
            { title: 'Business Process Automation', icon: Workflow, desc: 'End-to-end automation of complex business processes.' },
            { title: 'Custom AI Workflows', icon: Layers, desc: 'Tailored workflows for operations, sales, and support.' },
          ],
        },
        {
          color: 'purple',
          muted: true,
          badge: 'Strategic Service',
          title: 'AI & Software Enablement',
          subtitle: 'Help teams adopt technology effectively.',
          features: [
            { title: 'Tech Stack Setup', icon: Settings, desc: 'Complete setup and configuration of your business tech stack.' },
            { title: 'Workflow Design', icon: Workflow, desc: 'Strategic design and implementation of efficient workflows.' },
            { title: 'AI Training & Adoption', icon: Users, desc: 'Helping your team understand and adopt AI tools effectively.' },
          ],
        },
      ]}
    />
  )
}
