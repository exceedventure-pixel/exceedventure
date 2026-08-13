import type { Metadata } from 'next'
import React from 'react'
import { Database, PanelsTopLeft, Zap } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('websites-softwares/custom-websites/single-page-apps').catch(
    () => null,
  )
  return generatePageMeta({
    slug: 'websites-softwares/custom-websites/single-page-apps',
    seoDoc,
    fallbackTitle: 'Single Page Apps',
    fallbackDescription:
      'Tools that flash white and reload on every action feel dated and slow, and every reload is another chance for someone to give up on it.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="websites-softwares/custom-websites/single-page-apps"
      color="teal"
      icon={PanelsTopLeft}
      badge="Specialist Service"
      titleLead="Single Page "
      titleAccent="Apps"
      subtitle="App-like experiences that respond instantly without full page reloads."
      hero={{
        badge: 'Single Page Apps',
        headline: 'Better than ',
        headlineAccent: 'a page reload.',
        pain: 'Every white flash is another chance for someone to give up.',
        symptoms: [
          'Every action reloads the page',
          'It feels sluggish all day',
          'Users lose their place',
        ],
        primaryCta: { label: 'Book a free product review', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '/our-works' },
      }}
      sections={[
        {
          color: 'teal',
          title: 'What this service covers',
          subtitle: 'App-like experiences that respond instantly without full page reloads.',
          features: [
            {
              title: 'App-Like Interfaces',
              icon: PanelsTopLeft,
              desc: 'Interactions that feel immediate rather than page-by-page.',
            },
            {
              title: 'State & Data',
              icon: Database,
              desc: 'Data handled cleanly so the interface stays predictable.',
            },
            {
              title: 'Snappy by Design',
              icon: Zap,
              desc: 'Loading handled in the background, not in front of the user.',
            },
          ],
        },
      ]}
    />
  )
}
