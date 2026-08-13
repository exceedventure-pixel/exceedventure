import type { Metadata } from 'next'
import React from 'react'
import { Building2, Code2, RefreshCw, ShieldCheck } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO(
    'websites-softwares/wordpress/wordpress-development-agency-london',
  ).catch(() => null)
  return generatePageMeta({
    slug: 'websites-softwares/wordpress/wordpress-development-agency-london',
    seoDoc,
    fallbackTitle: 'WordPress Development Agency London',
    fallbackDescription:
      'When the site goes down or an update breaks checkout, an unanswered support ticket is worthless. Being able to reach a real person matters more than most people expect.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="websites-softwares/wordpress/wordpress-development-agency-london"
      color="teal"
      icon={Building2}
      badge="Specialist Service"
      titleLead="WordPress Development Agency "
      titleAccent="London"
      subtitle="A London-based WordPress team for builds, migrations and ongoing support."
      hero={{
        badge: 'WordPress · London',
        headline: 'A WordPress team ',
        headlineAccent: 'you can actually reach.',
        pain: 'When checkout breaks, an unanswered ticket is worth nothing.',
        symptoms: [
          'Your last developer went quiet',
          'Support with no timeline',
          'Nobody can explain the build',
        ],
        primaryCta: { label: 'Get a free website review', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '/our-works' },
        reassurance: 'We will say if we are not the right fit.',
      }}
      sections={[
        {
          color: 'teal',
          title: 'What this service covers',
          subtitle: 'A London-based WordPress team for builds, migrations and ongoing support.',
          features: [
            {
              title: 'Custom Development',
              icon: Code2,
              desc: 'Plugins and features built to your spec rather than bolted on.',
            },
            {
              title: 'Migrations & Rebuilds',
              icon: RefreshCw,
              desc: 'Move off a dated site without losing traffic or content.',
            },
            {
              title: 'Ongoing Support',
              icon: ShieldCheck,
              desc: 'Updates, backups and fixes handled on a retainer.',
            },
          ],
        },
      ]}
    />
  )
}
