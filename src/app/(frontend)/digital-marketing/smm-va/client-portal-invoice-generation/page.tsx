import type { Metadata } from 'next'
import React from 'react'
import { Receipt, RefreshCw, Users } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("digital-marketing/smm-va/client-portal-invoice-generation").catch(() => null)
  return generatePageMeta({
    slug: "digital-marketing/smm-va/client-portal-invoice-generation",
    seoDoc,
    fallbackTitle: "Client Portal Access & Invoice Generation",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        color="blue"
        icon={Receipt}
        badge="Specialist Service"
        titleLead="Client Portal Access & Invoice "
        titleAccent="Generation"
        subtitle="Client-facing admin handled: portal access, invoices raised and payment chased."
        sections={[
          {
            color: "blue",
            title: 'What this service covers',
            subtitle: "Client-facing admin handled: portal access, invoices raised and payment chased.",
            features: [
              {
                title: "Portal Access",
                icon: Users,
                desc: "Clients set up and supported in your systems.",
              },
              {
                title: "Invoice Generation",
                icon: Receipt,
                desc: "Invoices raised accurately and on schedule.",
              },
              {
                title: "Payment Follow-Up",
                icon: RefreshCw,
                desc: "Polite, persistent chasing so you do not have to.",
              },
            ],
          },
        ]}
      />
  )
}
