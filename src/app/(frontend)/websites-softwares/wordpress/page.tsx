import type { Metadata } from 'next'
import React from 'react'
import { LayoutTemplate, Search, Smartphone, ShieldCheck } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('websites-softwares/wordpress').catch(() => null)
  return generatePageMeta({ slug: 'websites-softwares/wordpress', seoDoc, fallbackTitle: 'WordPress' })
}

export default function Page() {
  return (
    <ServiceDetail
      color="teal"
      icon={LayoutTemplate}
      badge="Sub Service"
      titleLead="Word"
      titleAccent="Press"
      subtitle="Flexible, SEO-friendly WordPress websites built for content, visibility, and long-term growth."
      sections={[
        {
          color: 'teal',
          title: 'Why this service works',
          subtitle: 'A dependable foundation for businesses that need a strong content hub and easy updates.',
          features: [
            { title: 'Business Websites', icon: Smartphone, desc: 'Fast, modern WordPress sites tailored to your brand and goals.' },
            { title: 'Content-Driven Pages', icon: Search, desc: 'Publish blogs, services, and resources without sacrificing performance.' },
            { title: 'Scalable Setup', icon: ShieldCheck, desc: 'Grow from a simple website to a larger digital presence with room to expand.' },
          ],
        },
      ]}
    />
  )
}
