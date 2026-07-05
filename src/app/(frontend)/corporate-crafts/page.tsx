import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { Reveal } from '@/components/Reveal'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('corporate-crafts').catch(() => null)
  return generatePageMeta({ slug: 'corporate-crafts', seoDoc, fallbackTitle: 'Corporate Crafts' })
}

const features = [
  { title: 'Pitch Decks', description: 'Compelling presentations that secure funding and win clients.' },
  { title: 'Business Plans', description: 'Comprehensive strategic documents for internal and external use.' },
  { title: 'Corporate Identity', description: 'Cohesive branding materials including letterheads, cards, and brochures.' },
  { title: 'Annual Reports', description: 'Professional layout and data visualization for stakeholder reporting.' },
  { title: 'Brand Guidelines', description: 'Detailed documentation ensuring consistent brand application.' },
  { title: 'Company Profiles', description: "Engaging overviews of your organization's mission and capabilities." },
]

export default function CorporateCraftsPage() {
  return (
    <div className="min-h-screen pb-20 pt-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-16 space-y-6 text-center">
          <div className="relative mx-auto mb-8 h-24 w-48">
            <Image src="/assets/corporate-crafts.svg" alt="Corporate Crafts" className="object-contain dark:hidden" fill priority />
            <Image src="/assets/dark-corporate-crafts.svg" alt="Corporate Crafts" className="hidden object-contain dark:block" fill priority />
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Professional <span className="text-primary">Corporate Solutions</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Elevate your business presence with premium corporate documentation, presentations, and
            branding materials.
          </p>
        </Reveal>

        <div className="mb-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal
              key={feature.title}
              delay={i * 60}
              className="rounded-2xl border border-border bg-card p-8 shadow-xl transition-colors hover:border-primary/50"
            >
              <CheckCircle2 className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Reveal>
          ))}
        </div>

        <div className="rounded-3xl bg-muted p-12 text-center">
          <h2 className="mb-6 text-3xl font-bold">Ready to upgrade your corporate materials?</h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
            Get in touch with us to discuss your project requirements and receive a customized quote.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start Project <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
