import type { Metadata } from 'next'
import React from 'react'
import { CalendarRange, DollarSign, RefreshCcw, ShieldCheck } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'
import { SubServiceGrid } from '@/components/SubServiceGrid'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('websites-softwares/pay-monthly-websites').catch(() => null)
  return generatePageMeta({
    slug: 'websites-softwares/pay-monthly-websites',
    seoDoc,
    fallbackTitle: 'Pay Monthly Websites',
  })
}

export default function Page() {
  return (
    <>
    <ServiceDetail
        slug="websites-softwares/pay-monthly-websites"
      color="teal"
      icon={CalendarRange}
      badge="Sub Service"
      titleLead="Pay Monthly "
      titleAccent="Websites"
      subtitle="Flexible website plans that make launching and improving your digital presence easier."
      sections={[
        {
          color: 'teal',
          title: 'Why this option is practical',
          subtitle:
            'A simpler route for businesses that want a professional website without a large upfront cost.',
          features: [
            {
              title: 'Budget-Friendly Launch',
              icon: DollarSign,
              desc: 'Spread the investment over time while getting your website live sooner.',
            },
            {
              title: 'Ongoing Support',
              icon: RefreshCcw,
              desc: 'Keep your site updated and aligned with your goals as things evolve.',
            },
            {
              title: 'Low Friction Start',
              icon: ShieldCheck,
              desc: 'A straightforward path to get online fast and stay supported.',
            },
          ],
        },
      ]}
    />
      <SubServiceGrid parentHref="/websites-softwares/pay-monthly-websites" />
    </>
  )
}
