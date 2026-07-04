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
  const seoDoc = await getPageSEO('services').catch(() => null)
  return generatePageMeta({ slug: 'services', seoDoc, fallbackTitle: 'Services' })
}

const services = [
  {
    title: 'Strategy & Consulting',
    slug: 'strategy',
    description:
      'We work with you to define goals, identify opportunities, and build a roadmap that sets your business up for sustainable growth.',
    highlights: ['Market research', 'Competitive analysis', 'Growth roadmapping', 'KPI definition'],
  },
  {
    title: 'Web Design & UX',
    slug: 'design',
    description:
      'Beautiful, conversion-focused design that earns trust and guides users to take action — on every device.',
    highlights: ['UI/UX design', 'Wireframing', 'Design systems', 'Accessibility'],
  },
  {
    title: 'Web Development',
    slug: 'development',
    description:
      'Fast, secure, and scalable web applications built on modern frameworks with performance baked in from day one.',
    highlights: ['Next.js / React', 'CMS integration', 'API development', 'Performance optimisation'],
  },
  {
    title: 'Search Engine Optimisation',
    slug: 'seo',
    description:
      'Technical and content SEO that earns lasting organic visibility on the platforms your customers use to find solutions.',
    highlights: ['Technical audit', 'On-page optimisation', 'Link building', 'Local SEO'],
  },
  {
    title: 'Paid Advertising',
    slug: 'ads',
    description:
      'Data-driven paid campaigns across Google, Meta, and LinkedIn that reach the right audience at the right time.',
    highlights: ['Google Ads', 'Meta Ads', 'LinkedIn Ads', 'Conversion tracking'],
  },
  {
    title: 'Analytics & Reporting',
    slug: 'analytics',
    description:
      'Clear, actionable reporting so you always know what is working, what is not, and where to invest next.',
    highlights: ['GA4 setup', 'Custom dashboards', 'Attribution modelling', 'Monthly reviews'],
  },
]

export default async function ServicesPage() {
  const seoDoc = await getPageSEO('services').catch(() => null)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageSchema({
              name: seoDoc?.meta?.title ?? 'Services',
              description:
                seoDoc?.meta?.description ??
                `Explore the full range of services offered by ${siteConfig.name}.`,
              url: `${siteConfig.url}/services`,
              type: 'WebPage',
            }),
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: 'Services', href: '/services' },
            ]),
          ]),
        }}
      />

      {/* Header */}
      <section className="py-24 bg-muted text-center px-4">
        <div className="container max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-lg text-muted-foreground">
            Everything you need to grow your business online — under one roof.
          </p>
        </div>
      </section>

      {/* Services listing */}
      <section className="py-24 bg-background">
        <div className="container max-w-5xl">
          <div className="flex flex-col gap-16">
            {services.map((service, i) => (
              <div
                key={service.slug}
                className={`grid md:grid-cols-2 gap-10 items-start ${i % 2 !== 0 ? 'md:[&>*:first-child]:order-2' : ''}`}
              >
                <div>
                  <h2 className="text-2xl font-bold mb-4">{service.title}</h2>
                  <p className="text-muted-foreground mb-6">{service.description}</p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Enquire about this service
                  </Link>
                </div>
                <ul className="rounded-lg border border-border divide-y divide-border">
                  {service.highlights.map((item) => (
                    <li key={item} className="px-5 py-3 text-sm flex items-center gap-2">
                      <span className="text-primary">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center px-4">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Not sure where to start?</h2>
          <p className="mb-8 opacity-90">
            Book a free discovery call. We will listen, ask the right questions, and recommend the
            best path forward.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-background text-foreground px-6 py-3 font-medium hover:bg-background/90 transition-colors"
          >
            Book a Free Call
          </Link>
        </div>
      </section>
    </>
  )
}
