import type { Metadata } from 'next'
import React from 'react'
import { ClipboardList, FileSearch, Wrench } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('digital-marketing/web-growth-seo/seo-audit-services').catch(
    () => null,
  )
  return generatePageMeta({
    slug: 'digital-marketing/web-growth-seo/seo-audit-services',
    seoDoc,
    fallbackTitle: 'SEO Audit Services',
    fallbackDescription:
      'Guessing at SEO is expensive. Before you spend another month on content or links, it is worth knowing which of them is actually your problem.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="digital-marketing/web-growth-seo/seo-audit-services"
      color="blue"
      icon={FileSearch}
      badge="Specialist Service"
      titleLead="SEO Audit "
      titleAccent="Services"
      subtitle="A clear picture of what's holding your rankings back, and what to fix first."
      hero={{
        badge: 'SEO Audit',
        headline: 'Find out what is actually ',
        headlineAccent: 'holding you back.',
        pain: 'Before another month of content or links, find out which one is your problem.',
        symptoms: [
          'Told to "do SEO", never told what first',
          'Traffic dropped and nobody knows why',
          'You paid for SEO and saw nothing',
        ],
        primaryCta: { label: 'Request your free audit', href: '/resources/freebies-audits' },
        secondaryCta: { label: 'Talk to a specialist', href: '/contact' },
        reassurance: 'Free, and yours to keep.',
      }}
      sections={[
        {
          color: 'blue',
          title: 'What this service covers',
          subtitle: "A clear picture of what's holding your rankings back, and what to fix first.",
          features: [
            {
              title: 'Technical Audit',
              icon: Wrench,
              desc: 'Crawling, indexing and speed problems found and explained.',
            },
            {
              title: 'Content Gaps',
              icon: FileSearch,
              desc: 'The searches you should own but currently do not.',
            },
            {
              title: 'Prioritised Actions',
              icon: ClipboardList,
              desc: 'A fix list ordered by impact, not by page count.',
            },
          ],
        },
      ]}
    />
  )
}
