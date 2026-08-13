import type { Metadata } from 'next'
import React from 'react'
import { LayoutDashboard, Server, Users } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'
import { SubServiceGrid } from '@/components/SubServiceGrid'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('websites-softwares/custom-web-systems').catch(() => null)
  return generatePageMeta({
    slug: 'websites-softwares/custom-web-systems',
    seoDoc,
    fallbackTitle: 'Custom Web Systems',
    fallbackDescription:
      'It worked when there were three of you. Now it is shared, half-broken, and one accidental overwrite away from a very bad afternoon.',
  })
}

export default function Page() {
  return (
    <>
      <ServiceDetail
        slug="websites-softwares/custom-web-systems"
        color="teal"
        icon={Server}
        badge="Sub Service"
        titleLead="Custom Web "
        titleAccent="Systems"
        subtitle="Bespoke web systems and internal tools built around how your business actually runs."
        hero={{
          badge: 'Custom Web Systems',
          headline: 'You have outgrown ',
          headlineAccent: 'the spreadsheet.',
          pain: 'Shared, half-broken, one overwrite from a very bad afternoon.',
          symptoms: [
            'Critical data in a shared sheet',
            'Off-the-shelf tools do not fit',
            'Paying per seat for unused software',
          ],
          primaryCta: { label: 'Book a free systems review', href: '/contact' },
          secondaryCta: { label: 'See our work', href: '/our-works' },
        }}
        sections={[
          {
            color: 'teal',
            title: 'What this service covers',
            subtitle:
              'Bespoke web systems and internal tools built around how your business actually runs.',
            features: [
              {
                title: 'Headless Architecture',
                icon: Server,
                desc: 'Content and data separated from presentation, so both can change.',
              },
              {
                title: 'Internal Dashboards',
                icon: LayoutDashboard,
                desc: 'One view of the work, instead of five spreadsheets.',
              },
              {
                title: 'Client Portals',
                icon: Users,
                desc: 'A private space for clients to track, approve and download.',
              },
            ],
          },
        ]}
      />
      <SubServiceGrid parentHref="/websites-softwares/custom-web-systems" />
    </>
  )
}
