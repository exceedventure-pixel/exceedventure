import type { Metadata } from 'next'
import React from 'react'
import { ClipboardList, FileText, Mail } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("digital-marketing/smm-va/administrative-operational-support").catch(() => null)
  return generatePageMeta({
    slug: "digital-marketing/smm-va/administrative-operational-support",
    seoDoc,
    fallbackTitle: "Administrative & Operational Support",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        slug="digital-marketing/smm-va/administrative-operational-support"
        color="blue"
        icon={ClipboardList}
        badge="Specialist Service"
        titleLead="Administrative & Operational "
        titleAccent="Support"
        subtitle="Trained assistants handling the admin that keeps pulling you away from the work."
        sections={[
          {
            color: "blue",
            title: 'What this service covers',
            subtitle: "Trained assistants handling the admin that keeps pulling you away from the work.",
            features: [
              {
                title: "Inbox & Calendar",
                icon: Mail,
                desc: "Mail triaged and diaries kept straight.",
              },
              {
                title: "Document Handling",
                icon: FileText,
                desc: "Paperwork prepared, filed and where you expect it.",
              },
              {
                title: "Process Support",
                icon: ClipboardList,
                desc: "Your routines followed properly, every time.",
              },
            ],
          },
        ]}
      />
  )
}
