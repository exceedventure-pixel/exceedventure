import type { Metadata } from 'next'
import React from 'react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('resources/documentation').catch(() => null)
  return generatePageMeta({ slug: 'resources/documentation', seoDoc, fallbackTitle: 'Documentation' })
}

export default function DocumentationPage() {
  return (
    <div className="min-h-screen">
      <PageHero
        title="Documentation"
        subtitle="Comprehensive guides, API references, and tutorials to help you get the most out of our services and products."
      />
      <div className="px-[5%] pb-24">
        <Reveal className="mx-auto max-w-3xl rounded-2xl border border-border bg-muted/50 p-12 text-center text-muted-foreground">
          <p className="mb-4 text-xl">📚 Documentation Portal</p>
          <p>
            Our documentation portal is under construction. Check back soon for comprehensive guides
            and tutorials.
          </p>
        </Reveal>
      </div>
    </div>
  )
}
