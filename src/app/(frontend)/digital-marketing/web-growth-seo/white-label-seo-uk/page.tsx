import type { Metadata } from 'next'
import React from 'react'
import { BarChart3, Handshake, Layers } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('digital-marketing/web-growth-seo/white-label-seo-uk').catch(
    () => null,
  )
  return generatePageMeta({
    slug: 'digital-marketing/web-growth-seo/white-label-seo-uk',
    seoDoc,
    fallbackTitle: 'White Label SEO UK',
    fallbackDescription:
      'Clients keep asking. Turning the work away does not just cost you that project — it sends them to an agency that will happily take the rest of their budget too.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="digital-marketing/web-growth-seo/white-label-seo-uk"
      color="blue"
      icon={Handshake}
      badge="Specialist Service"
      titleLead="White Label SEO "
      titleAccent="UK"
      subtitle="SEO delivered under your brand, for agencies that need extra capacity."
      hero={{
        badge: 'White Label SEO',
        headline: 'Sell SEO without ',
        headlineAccent: 'hiring an SEO team.',
        pain: 'Turning the work away sends the rest of their budget with it.',
        symptoms: [
          'You turn down billable SEO work',
          'In-house cannot be justified yet',
          'Freelancers make delivery unpredictable',
        ],
        primaryCta: { label: 'Request a partner pack', href: '/contact' },
        secondaryCta: { label: 'See pricing', href: '/pricing' },
        reassurance: 'Fully white label. Always.',
      }}
      sections={[
        {
          color: 'blue',
          title: 'What this service covers',
          subtitle: 'SEO delivered under your brand, for agencies that need extra capacity.',
          features: [
            {
              title: 'Delivered Under Your Brand',
              icon: Handshake,
              desc: 'We stay invisible; the work goes out as yours.',
            },
            {
              title: 'Scalable Capacity',
              icon: Layers,
              desc: 'Take on more clients without hiring ahead of the revenue.',
            },
            {
              title: 'Reports You Can Send On',
              icon: BarChart3,
              desc: 'Client-ready reporting in your own template.',
            },
          ],
        },
      ]}
    />
  )
}
