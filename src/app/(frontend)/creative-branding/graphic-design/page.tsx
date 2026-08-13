import type { Metadata } from 'next'
import React from 'react'
import { Brush, Image, Layers, Printer } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'
import { SubServiceGrid } from '@/components/SubServiceGrid'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('creative-branding/graphic-design').catch(() => null)
  return generatePageMeta({
    slug: 'creative-branding/graphic-design',
    seoDoc,
    fallbackTitle: 'Graphic Design',
    fallbackDescription:
      'A weak layout never gets criticised. It gets scrolled past. You never hear about the customers you lost to something that simply did not hold attention.',
  })
}

export default function Page() {
  return (
    <>
      <ServiceDetail
        slug="creative-branding/graphic-design"
        color="purple"
        icon={Brush}
        badge="Sub Service"
        titleLead="Graphic "
        titleAccent="Design"
        subtitle="Graphic design across digital and print, delivered on brief."
        hero={{
          badge: 'Graphic Design',
          headline: 'Noticed, ',
          headlineAccent: 'or scrolled past.',
          pain: 'You never hear about the customers you lost to something forgettable.',
          symptoms: [
            'Your material blends into the feed',
            'Design happens in whatever tool is near',
            'You cannot reuse what you made',
          ],
          primaryCta: { label: 'Get a free design review', href: '/contact' },
          secondaryCta: { label: 'See our work', href: '/our-works' },
        }}
        sections={[
          {
            color: 'purple',
            title: 'What this service covers',
            subtitle: 'Graphic design across digital and print, delivered on brief.',
            features: [
              {
                title: 'Digital Graphics',
                icon: Image,
                desc: 'Assets sized and built for every platform you post to.',
              },
              {
                title: 'Print Design',
                icon: Printer,
                desc: 'Artwork prepared properly for the press.',
              },
              {
                title: 'Campaign Assets',
                icon: Layers,
                desc: 'Full sets that stay consistent across every placement.',
              },
            ],
          },
        ]}
      />
      <SubServiceGrid parentHref="/creative-branding/graphic-design" />
    </>
  )
}
