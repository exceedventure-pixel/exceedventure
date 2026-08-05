import type { Metadata } from 'next'
import React from 'react'
import { FileText, PenTool, Layers, Sparkles } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('creative-branding/content-supply').catch(() => null)
  return generatePageMeta({
    slug: 'creative-branding/content-supply',
    seoDoc,
    fallbackTitle: 'Content Supply',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      color="purple"
      icon={FileText}
      badge="Sub Service"
      titleLead="Content "
      titleAccent="Supply"
      subtitle="Get a steady flow of on-brand content that supports campaigns, channels, and growth goals."
      sections={[
        {
          color: 'purple',
          title: 'What this service supports',
          subtitle:
            'A practical content pipeline for brands that need consistent output without friction.',
          features: [
            {
              title: 'Copywriting',
              icon: PenTool,
              desc: 'Create clear, brand-aligned messaging for websites, campaigns, and content pieces.',
            },
            {
              title: 'Content Production',
              icon: Layers,
              desc: 'Keep your content calendar moving with structured, repeatable support.',
            },
            {
              title: 'Brand-Aligned Output',
              icon: Sparkles,
              desc: 'Create materials that feel consistent, polished, and ready to publish.',
            },
          ],
        },
      ]}
    />
  )
}
