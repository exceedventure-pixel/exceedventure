import type { Metadata } from 'next'
import React from 'react'
import { ClipboardList, FileText, Mail } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO(
    'digital-marketing/smm-va/administrative-operational-support',
  ).catch(() => null)
  return generatePageMeta({
    slug: 'digital-marketing/smm-va/administrative-operational-support',
    seoDoc,
    fallbackTitle: 'Administrative & Operational Support',
    fallbackDescription:
      'Inbox, calendar, suppliers, paperwork. Every one of them needs a decision from you, so everything queues behind whichever day you find the time.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="digital-marketing/smm-va/administrative-operational-support"
      color="blue"
      icon={ClipboardList}
      badge="Specialist Service"
      titleLead="Administrative & Operational "
      titleAccent="Support"
      subtitle="Trained assistants handling the admin that keeps pulling you away from the work."
      hero={{
        badge: 'Admin Support',
        headline: 'You are the bottleneck ',
        headlineAccent: 'in your own business.',
        pain: 'Everything queues behind whichever day you find the time.',
        symptoms: [
          'Nothing moves while you are away',
          'Your inbox is the company task list',
          'Admin gets done at night',
        ],
        primaryCta: { label: 'Get a free workload review', href: '/contact' },
        secondaryCta: { label: 'See pricing', href: '/pricing' },
      }}
      sections={[
        {
          color: 'blue',
          title: 'What this service covers',
          subtitle:
            'Trained assistants handling the admin that keeps pulling you away from the work.',
          features: [
            {
              title: 'Inbox & Calendar',
              icon: Mail,
              desc: 'Mail triaged and diaries kept straight.',
            },
            {
              title: 'Document Handling',
              icon: FileText,
              desc: 'Paperwork prepared, filed and where you expect it.',
            },
            {
              title: 'Process Support',
              icon: ClipboardList,
              desc: 'Your routines followed properly, every time.',
            },
          ],
        },
      ]}
    />
  )
}
