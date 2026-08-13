import type { Metadata } from 'next'
import React from 'react'
import { CalendarCheck, Mail, RefreshCw } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('digital-marketing/smm-va/booking-reservation-management').catch(
    () => null,
  )
  return generatePageMeta({
    slug: 'digital-marketing/smm-va/booking-reservation-management',
    seoDoc,
    fallbackTitle: 'Booking & Reservation Management',
    fallbackDescription:
      'The enquiry came in at eight in the evening. By the time it was read the next morning, they had already booked with whoever replied first.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="digital-marketing/smm-va/booking-reservation-management"
      color="blue"
      icon={CalendarCheck}
      badge="Specialist Service"
      titleLead="Booking & Reservation "
      titleAccent="Management"
      subtitle="Someone managing your diary, bookings and confirmations from end to end."
      hero={{
        badge: 'Booking Management',
        headline: 'A missed booking is ',
        headlineAccent: 'revenue you never see.',
        pain: 'The enquiry came in at eight. By morning they had booked elsewhere.',
        symptoms: [
          'Enquiries wait overnight',
          'Double bookings and no-shows',
          'Your calendar lives in two places',
        ],
        primaryCta: { label: 'Get a free booking review', href: '/contact' },
        secondaryCta: { label: 'See pricing', href: '/pricing' },
      }}
      sections={[
        {
          color: 'blue',
          title: 'What this service covers',
          subtitle: 'Someone managing your diary, bookings and confirmations from end to end.',
          features: [
            {
              title: 'Diary Management',
              icon: CalendarCheck,
              desc: 'Slots filled and clashes caught before they happen.',
            },
            {
              title: 'Confirmations & Reminders',
              icon: Mail,
              desc: 'Fewer no-shows, because people get reminded.',
            },
            {
              title: 'Rescheduling',
              icon: RefreshCw,
              desc: 'Changes handled without the back-and-forth landing on you.',
            },
          ],
        },
      ]}
    />
  )
}
