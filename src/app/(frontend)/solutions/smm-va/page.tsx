import type { Metadata } from 'next'
import React from 'react'
import { Users, Share2, MessageCircle, Calendar, Headphones, Inbox, BarChart3 } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('solutions/smm-va').catch(() => null)
  return generatePageMeta({
    slug: 'solutions/smm-va',
    seoDoc,
    fallbackTitle: 'SMM & VA Services',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      color="indigo"
      icon={Users}
      badge="Support Service"
      titleLead="SMM & "
      titleAccent="Virtual Assistants"
      subtitle="Keep your social presence active and your back office moving with dedicated management and support."
      sections={[
        {
          color: 'indigo',
          title: 'What this service is for',
          subtitle:
            'Hands-on social media management and virtual assistance that free your team to focus on growth.',
          features: [
            { title: 'Social Media Management', icon: Share2, desc: 'Full account management across the platforms that matter to you.' },
            { title: 'Community Engagement', icon: MessageCircle, desc: 'Replies, comments, and DMs handled to grow an active audience.' },
            { title: 'Content Scheduling', icon: Calendar, desc: 'Planned, consistent posting so your feed never goes dark.' },
            { title: 'Virtual Assistants', icon: Headphones, desc: 'Dedicated support for admin, research, and day-to-day operations.' },
            { title: 'Inbox & DM Handling', icon: Inbox, desc: 'Timely, on-brand responses that turn conversations into leads.' },
            { title: 'Reporting', icon: BarChart3, desc: 'Clear reporting on growth, engagement, and response times.' },
          ],
        },
      ]}
    />
  )
}
