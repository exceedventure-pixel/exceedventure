import type { Metadata } from 'next'
import React from 'react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { jsonLdScript, webPageSchema, breadcrumbSchema } from '@/utilities/jsonld'
import siteConfig from '@/config/site'

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

      {/* Header */}
      <section className="py-24 bg-muted text-center px-4">
        <div className="container max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-lg text-muted-foreground">
            Have a project in mind? We&apos;d love to hear about it. Reach out and we will get back
            to you within one business day.
          </p>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container max-w-5xl grid md:grid-cols-2 gap-16">
          {/* Contact details */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
            <dl className="flex flex-col gap-5 text-sm">
              {siteConfig.contact.email && (
                <div>
                  <dt className="text-muted-foreground mb-1">Email</dt>
                  <dd>
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="hover:text-primary transition-colors"
                    >
                      {siteConfig.contact.email}
                    </a>
                  </dd>
                </div>
              )}
              {siteConfig.contact.phone && (
                <div>
                  <dt className="text-muted-foreground mb-1">Phone</dt>
                  <dd>
                    <a
                      href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`}
                      className="hover:text-primary transition-colors"
                    >
                      {siteConfig.contact.phone}
                    </a>
                  </dd>
                </div>
              )}
              {siteConfig.contact.address && (
                <div>
                  <dt className="text-muted-foreground mb-1">Address</dt>
                  <dd className="whitespace-pre-line">{siteConfig.contact.address}</dd>
                </div>
              )}
            </dl>

            {siteConfig.social.length > 0 && (
              <div className="mt-10">
                <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
                  Follow Us
                </h3>
                <div className="flex flex-wrap gap-3">
                  {siteConfig.social.map(({ platform, href }) => (
                    <a
                      key={platform}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm px-4 py-2 rounded-md border border-border hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      {platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Simple contact form */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Send a Message</h2>
            <form
              action="/api/contact"
              method="POST"
              className="flex flex-col gap-5"
            >
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
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
