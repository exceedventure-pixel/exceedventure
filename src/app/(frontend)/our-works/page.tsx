import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'
import { ArrowRight } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('our-works').catch(() => null)
  return generatePageMeta({ slug: 'our-works', seoDoc, fallbackTitle: 'Our Works' })
}

export default function OurWorksPage() {
  return (
    <div className="min-h-screen">
      <PageHero
        title={
          <>
            Our <span className="text-primary">Works</span>
          </>
        }
        subtitle="A selection of the projects we've delivered for clients worldwide — from websites and web systems to branding and content."
      />

      <div className="container pb-24">
        <Reveal className="mx-auto max-w-3xl rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <h2 className="mb-3 text-2xl font-bold">Portfolio coming soon</h2>
          <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
            We&apos;re curating our featured projects into the new portfolio. In the meantime, tell
            us what you&apos;re building — we&apos;d love to show you relevant work from our archive.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start a Project <ArrowRight className="h-5 w-5" />
          </Link>
        </Reveal>
      </div>
    </div>
  )
}
