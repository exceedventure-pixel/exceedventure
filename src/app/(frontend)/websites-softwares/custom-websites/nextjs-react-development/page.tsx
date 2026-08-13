import type { Metadata } from 'next'
import React from 'react'
import { Code2, Component, Gauge } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO(
    'websites-softwares/custom-websites/nextjs-react-development',
  ).catch(() => null)
  return generatePageMeta({
    slug: 'websites-softwares/custom-websites/nextjs-react-development',
    seoDoc,
    fallbackTitle: 'Next.js & React Development',
    fallbackDescription:
      'Every extra second costs you conversions and rankings. Most slow sites are not slow because of hosting — they are slow because of how they were built.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="websites-softwares/custom-websites/nextjs-react-development"
      color="teal"
      icon={Code2}
      badge="Specialist Service"
      titleLead="Next.js & React "
      titleAccent="Development"
      subtitle="Modern front-ends built with Next.js and React for speed and flexibility."
      hero={{
        badge: 'Next.js & React',
        headline: 'Slow sites lose customers ',
        headlineAccent: 'before they load.',
        pain: 'Most slow sites are not slow because of hosting — they were built that way.',
        symptoms: [
          'Core Web Vitals failing',
          'Seconds before it works on mobile',
          'Each new feature slows it further',
        ],
        primaryCta: { label: 'Get a free performance review', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '/our-works' },
      }}
      sections={[
        {
          color: 'teal',
          title: 'What this service covers',
          subtitle: 'Modern front-ends built with Next.js and React for speed and flexibility.',
          features: [
            {
              title: 'Next.js Builds',
              icon: Code2,
              desc: 'Server rendering and routing set up for speed and SEO.',
            },
            {
              title: 'Component Systems',
              icon: Component,
              desc: 'Reusable components so future pages cost less to build.',
            },
            {
              title: 'Core Web Vitals',
              icon: Gauge,
              desc: 'Performance budgets held to to keep the scores green.',
            },
          ],
        },
      ]}
    />
  )
}
