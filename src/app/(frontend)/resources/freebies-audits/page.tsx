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
  const seoDoc = await getPageSEO('resources/freebies-audits').catch(() => null)
  return generatePageMeta({
    slug: 'resources/freebies-audits',
    seoDoc,
    fallbackTitle: 'Freebies & Audits',
  })
}

export default function FreebiesAuditsPage() {
  return (
    <div className="min-h-screen">
      <PageHero
        title="Freebies & Audits"
        subtitle="Get valuable resources for free and request a comprehensive audit of your digital presence."
      />
      <div className="px-[5%] pb-24">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          <Reveal className="rounded-2xl border border-border bg-card p-8">
            <div className="mb-4 text-4xl">🎁</div>
            <h3 className="mb-4 text-2xl font-bold">Free Resources</h3>
            <p className="mb-6 text-muted-foreground">
              Download checklists, templates, and guides to help grow your business.
            </p>
            <ul className="mb-6 space-y-2 text-muted-foreground">
              <li>✓ Website Launch Checklist</li>
              <li>✓ SEO Optimization Guide</li>
              <li>✓ Social Media Templates</li>
              <li>✓ Email Marketing Scripts</li>
            </ul>
            <button
              disabled
              className="rounded-md border border-primary/50 px-5 py-2.5 text-sm font-medium text-primary/70"
            >
              Coming Soon
            </button>
          </Reveal>

          <Reveal delay={100} className="rounded-2xl border border-border bg-card p-8">
            <div className="mb-4 text-4xl">🔍</div>
            <h3 className="mb-4 text-2xl font-bold">Request an Audit</h3>
            <p className="mb-6 text-muted-foreground">
              Get a free comprehensive audit of your website or content strategy.
            </p>
            <ul className="mb-6 space-y-2 text-muted-foreground">
              <li>✓ Website Performance Audit</li>
              <li>✓ SEO Health Check</li>
              <li>✓ Content Strategy Review</li>
              <li>✓ Conversion Rate Analysis</li>
            </ul>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Request Audit
            </Link>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
