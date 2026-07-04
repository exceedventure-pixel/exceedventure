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
  const seoDoc = await getPageSEO('home').catch(() => null)
  return generatePageMeta({ slug: '/', seoDoc, fallbackTitle: siteConfig.seo.defaultTitle })
}

export default async function HomePage() {
  const seoDoc = await getPageSEO('home').catch(() => null)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageSchema({
              name: seoDoc?.meta?.title ?? siteConfig.seo.defaultTitle,
              description: seoDoc?.meta?.description ?? siteConfig.seo.defaultDescription,
              url: siteConfig.url,
            }),
            breadcrumbSchema([{ name: 'Home', href: '/' }]),
          ]),
        }}
      />

      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-[80vh] bg-linear-to-br from-background to-muted text-center px-4">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-4">
            {siteConfig.tagline}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Expert Services That{' '}
            <span className="text-primary">Grow Your Business</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            {siteConfig.seo.defaultDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 font-medium hover:bg-muted transition-colors"
            >
              Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* Services overview */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What We Do</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We provide a full suite of services designed to help your business thrive online and
              offline.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Strategy',
                description:
                  'Data-driven strategy sessions to define your goals and map the fastest path to growth.',
              },
              {
                title: 'Design',
                description:
                  'Conversion-focused design that builds trust and turns visitors into customers.',
              },
              {
                title: 'Development',
                description:
                  'Fast, accessible, and secure web solutions built on modern technology.',
              },
              {
                title: 'SEO',
                description:
                  'Technical and content SEO that earns organic visibility on the channels that matter.',
              },
              {
                title: 'Marketing',
                description:
                  'Paid and organic campaigns that reach your ideal audience at the right moment.',
              },
              {
                title: 'Analytics',
                description:
                  'Clear reporting so you always know what is working and where to invest next.',
              },
            ].map((service) => (
              <div
                key={service.title}
                className="rounded-lg border border-border p-6 hover:border-primary/50 transition-colors"
              >
                <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 font-medium hover:bg-muted transition-colors"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="mb-8 opacity-90">
            Let&apos;s talk about your project. Our team is ready to help you reach your goals.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-background text-foreground px-6 py-3 font-medium hover:bg-background/90 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </>
  )
}
