import type { Metadata } from 'next'
import React from 'react'
import { Palette, PenTool, Layout, Layers, Box, Monitor, Brush } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('services/creative-assets-branding').catch(() => null)
  return generatePageMeta({
    slug: 'services/creative-assets-branding',
    seoDoc,
    fallbackTitle: 'Creative Assets & Branding',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      color="purple"
      icon={Brush}
      badge="Creative Service"
      titleLead="Creative Assets & "
      titleAccent="Branding"
      subtitle="Elevate your brand with distinctive design and creative assets that resonate."
      sections={[
        {
          color: 'purple',
          title: 'What this service is for',
          subtitle:
            'Strategic branding and design solutions that define your identity and captivate your audience.',
          features: [
            { title: 'Brand Identity', icon: Palette, desc: 'Building a cohesive visual language that sets your brand apart.' },
            { title: 'Graphic Design', icon: PenTool, desc: 'Stunning visuals for marketing materials, social media, and more.' },
            { title: 'UI/UX Design', icon: Layout, desc: 'User-centric interface designs that deliver intuitive digital experiences.' },
            { title: 'Motion Graphics', icon: Layers, desc: 'Engaging animations that bring your stories and ideas to life.' },
            { title: 'Product Packaging', icon: Box, desc: 'Creative packaging solutions that capture attention on the shelf.' },
            { title: 'Digital Assets', icon: Monitor, desc: 'Custom illustrations and icons tailored to your digital presence.' },
          ],
        },
      ]}
    />
  )
}
