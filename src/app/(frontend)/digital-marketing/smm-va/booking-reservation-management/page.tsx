import type { Metadata } from 'next'
import React from 'react'
import { CalendarCheck, Mail, RefreshCw } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("digital-marketing/smm-va/booking-reservation-management").catch(() => null)
  return generatePageMeta({
    slug: "digital-marketing/smm-va/booking-reservation-management",
    seoDoc,
    fallbackTitle: "Booking & Reservation Management",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        color="blue"
        icon={CalendarCheck}
        badge="Specialist Service"
        titleLead="Booking & Reservation "
        titleAccent="Management"
        subtitle="Someone managing your diary, bookings and confirmations from end to end."
        sections={[
          {
            color: "blue",
            title: 'What this service covers',
            subtitle: "Someone managing your diary, bookings and confirmations from end to end.",
            features: [
              {
                title: "Diary Management",
                icon: CalendarCheck,
                desc: "Slots filled and clashes caught before they happen.",
              },
              {
                title: "Confirmations & Reminders",
                icon: Mail,
                desc: "Fewer no-shows, because people get reminded.",
              },
              {
                title: "Rescheduling",
                icon: RefreshCw,
                desc: "Changes handled without the back-and-forth landing on you.",
              },
            ],
          },
        ]}
      />
  )
}
