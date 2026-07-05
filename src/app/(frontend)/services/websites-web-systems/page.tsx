import type { Metadata } from 'next'
import React from 'react'
import { Globe, Layout, MousePointerClick, LayoutDashboard, Users, Database } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('services/websites-web-systems').catch(() => null)
  return generatePageMeta({
    slug: 'services/websites-web-systems',
    seoDoc,
    fallbackTitle: 'Websites & Web Systems',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      color="teal"
      icon={Globe}
      badge="Core Service"
      titleLead="Websites & "
      titleAccent="Web Systems"
      subtitle="Build high-performance digital foundations."
      sections={[
        {
          color: 'teal',
          title: 'What this service is for',
          subtitle: 'Comprehensive web solutions designed to meet modern business demands.',
          features: [
            { title: 'Business Websites', icon: Globe, desc: 'Professional digital presence representing your brand.' },
            { title: 'Landing Pages', icon: Layout, desc: 'High-converting pages designed for specific campaigns.' },
            { title: 'Conversion-Focused Websites', icon: MousePointerClick, desc: 'Optimized user journeys to turn visitors into customers.' },
            { title: 'Web Dashboards', icon: LayoutDashboard, desc: 'Visual interfaces to monitor and manage your data.' },
            { title: 'Client Portals', icon: Users, desc: 'Secure access areas for your customers and partners.' },
            { title: 'System-Connected Websites', icon: Database, desc: 'Seamless integration with CRM, forms, and APIs.' },
          ],
        },
      ]}
    />
  )
}
