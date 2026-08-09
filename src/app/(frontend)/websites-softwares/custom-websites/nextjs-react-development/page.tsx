import type { Metadata } from 'next'
import React from 'react'
import { Code2, Component, Gauge } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("websites-softwares/custom-websites/nextjs-react-development").catch(() => null)
  return generatePageMeta({
    slug: "websites-softwares/custom-websites/nextjs-react-development",
    seoDoc,
    fallbackTitle: "Next.js & React Development",
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
        sections={[
          {
            color: "teal",
            title: 'What this service covers',
            subtitle: "Modern front-ends built with Next.js and React for speed and flexibility.",
            features: [
              {
                title: "Next.js Builds",
                icon: Code2,
                desc: "Server rendering and routing set up for speed and SEO.",
              },
              {
                title: "Component Systems",
                icon: Component,
                desc: "Reusable components so future pages cost less to build.",
              },
              {
                title: "Core Web Vitals",
                icon: Gauge,
                desc: "Performance budgets held to to keep the scores green.",
              },
            ],
          },
        ]}
      />
  )
}
