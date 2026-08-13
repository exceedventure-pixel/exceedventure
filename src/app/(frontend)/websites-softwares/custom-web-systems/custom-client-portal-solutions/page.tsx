import type { Metadata } from 'next'
import React from 'react'
import { FileText, LayoutDashboard, ShieldCheck, Users } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO(
    'websites-softwares/custom-web-systems/custom-client-portal-solutions',
  ).catch(() => null)
  return generatePageMeta({
    slug: 'websites-softwares/custom-web-systems/custom-client-portal-solutions',
    seoDoc,
    fallbackTitle: 'Custom Client Portal Solutions',
    fallbackDescription:
      'Where is my invoice, what is the status, can you resend that file. Every one of those emails is a job your team does that a portal would do for nothing.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="websites-softwares/custom-web-systems/custom-client-portal-solutions"
      color="teal"
      icon={Users}
      badge="Specialist Service"
      titleLead="Custom Client Portal "
      titleAccent="Solutions"
      subtitle="Private portals where clients track progress, approve work and reach their files."
      hero={{
        badge: 'Client Portals',
        headline: 'Emails your clients ',
        headlineAccent: 'should not have to send.',
        pain: 'Where is my invoice, what is the status, can you resend that file.',
        symptoms: [
          'Constant emails for documents',
          'Files buried in email threads',
          'Nobody sees status without asking',
        ],
        primaryCta: { label: 'Book a free portal review', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '/our-works' },
      }}
      sections={[
        {
          color: 'teal',
          title: 'What this service covers',
          subtitle:
            'Private portals where clients track progress, approve work and reach their files.',
          features: [
            {
              title: 'Secure Access',
              icon: ShieldCheck,
              desc: 'Each client sees their own work and nothing else.',
            },
            {
              title: 'Project Visibility',
              icon: LayoutDashboard,
              desc: 'Progress clients can check without emailing you.',
            },
            {
              title: 'Files & Approvals',
              icon: FileText,
              desc: 'Deliverables and sign-off in one place, on the record.',
            },
          ],
        },
      ]}
    />
  )
}
