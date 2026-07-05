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
  const seoDoc = await getPageSEO('contact').catch(() => null)
  return generatePageMeta({ slug: 'contact', seoDoc, fallbackTitle: 'Contact' })
}

export default async function ContactPage() {
  const seoDoc = await getPageSEO('contact').catch(() => null)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageSchema({
              name: seoDoc?.meta?.title ?? 'Contact',
              description:
                seoDoc?.meta?.description ??
                `Get in touch with ${siteConfig.name}. We would love to hear about your project.`,
              url: `${siteConfig.url}/contact`,
              type: 'ContactPage',
            }),
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: 'Contact', href: '/contact' },
            ]),
          ]),
        }}
      />

      <PageHero
        title="Contact Us"
        subtitle="We'd love to hear from you. Reach out to us for any inquiries or collaborations."
      />

      <div className="container pb-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Contact info */}
          <Reveal className="flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-bold">Get in Touch</h2>
              <p className="mt-2 text-muted-foreground">
                Fill out the form or contact us directly using the information below.
              </p>
            </div>

            <div className="mt-2 flex flex-col gap-6">
              {siteConfig.contact.email && (
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Email</h3>
                    <a href={`mailto:${siteConfig.contact.email}`} className="text-muted-foreground transition-colors hover:text-primary">
                      {siteConfig.contact.email}
                    </a>
                  </div>
                </div>
              )}
              {siteConfig.contact.address && (
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-primary/10 p-3 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">Address</h3>
                    <p className="whitespace-pre-line text-muted-foreground">{siteConfig.contact.address}</p>
                  </div>
                </div>
              )}
            </div>

            {siteConfig.social.length > 0 && (
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Follow Us
                </h3>
                <div className="flex flex-wrap gap-3">
                  {siteConfig.social.map(({ platform, href }) => (
                    <a
                      key={platform}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      {platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </Reveal>

          {/* Contact form */}
          <Reveal delay={120} className="rounded-2xl border border-border bg-card p-8">
            <form action="/api/contact" method="POST" className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-medium">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your Name"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="your@email.com"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-sm font-medium">
                  Message <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="How can we help you?"
                  className="resize-y rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Send Message
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </>
  )
}
