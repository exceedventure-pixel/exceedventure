import type { Metadata } from 'next'
import React from 'react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { jsonLdScript, webPageSchema, breadcrumbSchema } from '@/utilities/jsonld'
import siteConfig from '@/config/site'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('about').catch(() => null)
  return generatePageMeta({ slug: 'about', seoDoc, fallbackTitle: 'About Us' })
}

export default async function AboutPage() {
  const seoDoc = await getPageSEO('about').catch(() => null)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageSchema({
              name: seoDoc?.meta?.title ?? `About Us`,
              description:
                seoDoc?.meta?.description ??
                `Learn more about ${siteConfig.name} — who we are, what we stand for, and how we help our clients succeed.`,
              url: `${siteConfig.url}/about`,
              type: 'AboutPage',
            }),
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: 'About', href: '/about' },
            ]),
          ]),
        }}
      />

      <PageHero
        title="About Exceed Venture"
        subtitle="We are a team of innovators, creators, and strategists dedicated to empowering businesses through technology."
      />

      <div className="container pb-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal className="space-y-6 text-lg text-foreground/80">
            <p>
              At Exceed Venture, we believe in the power of digital transformation. Our mission is
              to help businesses streamline their operations, reach their target audience, and
              achieve sustainable growth.
            </p>
            <p>
              Founded with a vision to bridge the gap between complex technology and business needs,
              we specialize in creating custom web solutions, implementing AI automation, and
              executing data-driven marketing strategies.
            </p>
            <p>
              Our team consists of experienced developers, designers, and marketing strategists who
              work together to deliver comprehensive digital solutions tailored to your unique
              business needs.
            </p>
          </Reveal>
          <Reveal
            delay={120}
            className="flex h-[400px] items-center justify-center rounded-2xl border border-border bg-muted/50"
          >
            <span className="text-muted-foreground">Team Image / Office Photo</span>
          </Reveal>
        </div>
      </div>
    </>
  )
}
