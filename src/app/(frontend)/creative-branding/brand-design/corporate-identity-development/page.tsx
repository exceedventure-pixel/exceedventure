import type { Metadata } from 'next'
import React from 'react'
import { Building2, FileText, Handshake, Layers } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO(
    'creative-branding/brand-design/corporate-identity-development',
  ).catch(() => null)
  return generatePageMeta({
    slug: 'creative-branding/brand-design/corporate-identity-development',
    seoDoc,
    fallbackTitle: 'Corporate Identity Development',
    fallbackDescription:
      'Different departments, different templates, different versions of the logo. To a customer that does not look like scale — it looks like nobody is in charge.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="creative-branding/brand-design/corporate-identity-development"
      color="purple"
      icon={Building2}
      badge="Specialist Service"
      titleLead="Corporate Identity "
      titleAccent="Development"
      subtitle="A consistent corporate identity across teams, offices and documents."
      hero={{
        badge: 'Corporate Identity',
        headline: 'One company. ',
        headlineAccent: 'One identity.',
        pain: 'Different templates in every department does not read as scale.',
        symptoms: [
          'Each team has its own logo version',
          'Documents look like different firms',
          'New starters have no templates',
        ],
        primaryCta: { label: 'Get a free identity review', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '/our-works' },
      }}
      sections={[
        {
          color: 'purple',
          title: 'What this service covers',
          subtitle: 'A consistent corporate identity across teams, offices and documents.',
          features: [
            {
              title: 'Identity System',
              icon: Layers,
              desc: 'One system that scales across divisions and markets.',
            },
            {
              title: 'Document Templates',
              icon: FileText,
              desc: 'Decks, reports and letterheads that already look right.',
            },
            {
              title: 'Rollout Support',
              icon: Handshake,
              desc: 'Help getting it adopted, not just delivered.',
            },
          ],
        },
      ]}
    />
  )
}
