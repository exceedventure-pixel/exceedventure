import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { jsonLdScript, webPageSchema, breadcrumbSchema } from '@/utilities/jsonld'
import siteConfig from '@/config/site'

export const dynamic = 'force-static'
export const revalidate = 3600

const title = `Careers | ${siteConfig.name}`
const description = `Join the ${siteConfig.name} team. We are always looking for talented people who are passionate about helping businesses grow.`
const url = `${siteConfig.url}/careers`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, type: 'website' },
}

const openRoles = [
  {
    title: 'Senior Web Developer',
    type: 'Full-time · Remote',
    description:
      'Build and maintain high-performance Next.js applications for our clients. Strong TypeScript and API integration experience required.',
  },
  {
    title: 'SEO Strategist',
    type: 'Full-time · Remote',
    description:
      'Own technical and content SEO strategy for a portfolio of client accounts. GA4, Search Console, and link-building experience essential.',
  },
  {
    title: 'UX / Product Designer',
    type: 'Full-time · Remote',
    description:
      'Design conversion-focused interfaces from wireframe to polished Figma handoff. Comfortable working across web, mobile, and landing pages.',
  },
]

export default function CareersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageSchema({
              name: title,
              description,
              url,
              type: 'WebPage',
            }),
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: 'Careers', href: '/careers' },
            ]),
          ]),
        }}
      />

      {/* Header */}
      <section className="py-24 bg-muted text-center px-4">
        <div className="container max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Work With Us</h1>
          <p className="text-lg text-muted-foreground">
            We are a remote-first team building world-class digital experiences. If you care about
            craft, outcomes, and long-term thinking, we want to hear from you.
          </p>
        </div>
      </section>

      {/* Why join */}
      <section className="py-24 bg-background">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold mb-12 text-center">Why {siteConfig.name}?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Remote-first', body: 'Work from anywhere. We trust our team to deliver regardless of location or timezone.' },
              { title: 'Meaningful work', body: 'Every project has a real client with real goals — no busy work or throwaway features.' },
              { title: 'Growth culture', body: 'We invest in learning budgets, conference attendance, and internal knowledge-sharing.' },
              { title: 'Competitive pay', body: 'Salaries benchmarked against top-quartile market rates plus performance bonuses.' },
              { title: 'Ownership', body: 'You will own your domain fully. We hire people we trust and give them the autonomy to prove it.' },
              { title: 'Flexible hours', body: 'Core collaboration hours with flexible start and finish times that work around your life.' },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-border p-6 bg-background">
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="py-24 bg-muted">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold mb-10">Open Roles</h2>
          <div className="flex flex-col gap-6">
            {openRoles.map((role) => (
              <div
                key={role.title}
                className="rounded-lg border border-border bg-background p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{role.title}</h3>
                  <p className="text-xs text-primary font-medium mb-3">{role.type}</p>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
                <Link
                  href={`/contact?role=${encodeURIComponent(role.title)}`}
                  className="inline-flex items-center justify-center rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors whitespace-nowrap self-start"
                >
                  Apply
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Speculative applications */}
      <section className="py-24 bg-primary text-primary-foreground text-center px-4">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Don&apos;t see a fit?</h2>
          <p className="mb-8 opacity-90">
            We are always happy to hear from exceptional people. Send us a note and we will keep you in mind for future openings.
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
