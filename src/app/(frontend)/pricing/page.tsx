import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'
import { Check } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { cn } from '@/utilities/ui'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('pricing').catch(() => null)
  return generatePageMeta({ slug: 'pricing', seoDoc, fallbackTitle: 'Pricing' })
}

const tiers = [
  {
    name: 'Starter',
    price: 'Custom',
    description: 'For small businesses getting their digital presence off the ground.',
    features: ['Business website', 'Basic SEO setup', 'Contact & lead forms', 'Mobile responsive'],
    featured: false,
  },
  {
    name: 'Growth',
    price: 'Custom',
    description: 'For growing teams that need automation, content, and performance marketing.',
    features: [
      'Everything in Starter',
      'Web systems & dashboards',
      'AI automation workflows',
      'Media buying & SEO',
      'Priority support',
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: "Let's talk",
    description: 'For established brands needing a full digital partner across every service.',
    features: [
      'Everything in Growth',
      'Dedicated account team',
      'Custom software (Softal Core)',
      'Full branding & content',
      'SLA & ongoing maintenance',
    ],
    featured: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <PageHero
        title={
          <>
            Simple, transparent <span className="text-primary">Pricing</span>
          </>
        }
        subtitle="Every project is different, so we scope pricing around your goals. Pick the plan closest to your needs and we'll tailor a custom quote."
      />

      <div className="container pb-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <Reveal
              key={tier.name}
              delay={i * 80}
              className={cn(
                'flex flex-col rounded-2xl border bg-card p-8 transition-all',
                tier.featured
                  ? 'border-primary shadow-xl md:-translate-y-2'
                  : 'border-border hover:shadow-lg',
              )}
            >
              {tier.featured && (
                <span className="mb-4 w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-bold">{tier.name}</h3>
              <div className="my-4 text-4xl font-bold">{tier.price}</div>
              <p className="mb-6 text-muted-foreground">{tier.description}</p>
              <ul className="mb-8 flex flex-col gap-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className={cn(
                  'mt-auto inline-flex items-center justify-center rounded-xl px-6 py-3 font-medium transition-colors',
                  tier.featured
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border border-border hover:bg-muted',
                )}
              >
                Get a Quote
              </Link>
            </Reveal>
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-muted-foreground">
          Need something bespoke? We build custom packages around your exact requirements.{' '}
          <Link href="/contact" className="text-primary hover:underline">
            Talk to us
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
