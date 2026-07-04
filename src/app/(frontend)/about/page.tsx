import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { jsonLdScript, webPageSchema, breadcrumbSchema } from '@/utilities/jsonld'
import siteConfig from '@/config/site'

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

      {/* Page header */}
      <section className="py-24 bg-muted text-center px-4">
        <div className="container max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-lg text-muted-foreground">
            We are a team of specialists passionate about helping businesses grow through smart
            strategy, great design, and cutting-edge technology.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-background">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold mb-6">Our Story</h2>
          <div className="prose dark:prose-invert max-w-none">
            <p>
              Founded in {siteConfig.org.foundingYear}, {siteConfig.name} was built on a simple
              belief: every business deserves world-class digital services, not just the ones with
              big budgets.
            </p>
            <p>
              Over the years we have helped hundreds of clients across industries launch products,
              enter new markets, and build audiences they are proud of. We do not believe in vanity
              metrics — we measure success by the growth our clients actually see.
            </p>
            <p>
              Today our team spans strategy, design, engineering, and marketing. We work as true
              partners — embedded in your goals, accountable to your results.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-muted">
        <div className="container">
          <h2 className="text-2xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { title: 'Transparency', body: 'No hidden agendas. You always know what we are doing and why.' },
              { title: 'Results First', body: 'We optimise for outcomes, not activity. Every decision maps to a goal.' },
              { title: 'Long-term Thinking', body: 'We build for durability — foundations that compound over time.' },
              { title: 'Collaboration', body: 'The best work happens together. We treat every client as a co-creator.' },
              { title: 'Craft', body: 'We take pride in the details. Quality is not optional.' },
              { title: 'Continuous Learning', body: 'We stay ahead of what is changing so our clients always have the edge.' },
            ].map((v) => (
              <div key={v.title} className="rounded-lg border border-border p-6 bg-background">
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center px-4">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Let&apos;s work together</h2>
          <p className="mb-8 opacity-90">
            Tell us about your project. We&apos;d love to learn more about your business.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-background text-foreground px-6 py-3 font-medium hover:bg-background/90 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  )
}
