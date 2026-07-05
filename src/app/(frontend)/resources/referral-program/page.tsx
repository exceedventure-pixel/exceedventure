import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('resources/referral-program').catch(() => null)
  return generatePageMeta({
    slug: 'resources/referral-program',
    seoDoc,
    fallbackTitle: 'Referral Program',
  })
}

const stats = [
  { value: '10%', label: 'Commission Rate' },
  { value: '30 Days', label: 'Cookie Duration' },
  { value: 'No Limit', label: 'Earning Potential' },
]

export default function ReferralProgramPage() {
  return (
    <div className="min-h-screen">
      <PageHero
        title="Referral Program"
        subtitle="Partner with us and earn rewards. Join our network of successful partners and grow together."
      />
      <div className="px-[5%] pb-24 text-center">
        <Reveal className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8">
          <div className="mb-6 text-5xl">🤝</div>
          <h3 className="mb-4 text-2xl font-bold">Join the Program</h3>
          <p className="mb-6 text-muted-foreground">
            Earn commissions for every client you refer to Exceed Venture. Our referral program
            rewards you for helping businesses discover our services.
          </p>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-background p-4">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Apply Now
          </Link>
        </Reveal>
      </div>
    </div>
  )
}
