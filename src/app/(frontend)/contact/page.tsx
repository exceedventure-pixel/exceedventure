import type { Metadata } from 'next'
import React from 'react'
import { Mail, MapPin, Phone, ArrowRight } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { jsonLdScript, webPageSchema, breadcrumbSchema } from '@/utilities/jsonld'
import siteConfig from '@/config/site'
import { socialIcons } from '@/components/SocialIcons'
import { Reveal } from '@/components/Reveal'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('contact').catch(() => null)
  return generatePageMeta({ slug: 'contact', seoDoc, fallbackTitle: 'Contact' })
}

/**
 * Contact — designed to land inside a single screen.
 *
 * The previous version opened with a `PageHero` (min-height 60vh) and then put
 * the details and the form *below* it, so you always arrived on a headline and
 * had to scroll before you could see the form at all. Three changes fix that:
 *
 *   1. No PageHero. The heading is part of the left column, sized to the space
 *      it has rather than to a fraction of the viewport.
 *   2. The section is `min-h-[calc(100svh - var(--header-h))]` — `svh`, not
 *      `vh`, because on mobile `100vh` measures the viewport *without* the
 *      browser chrome, which overflows by exactly the height of the URL bar and
 *      guarantees the scroll this page is meant to avoid. `--header-h` already
 *      exists for the homepage hero and tracks the sticky header (65px, 81px on
 *      large screens).
 *   3. Name and email share a row, so the form is four rows tall instead of six.
 *
 * `min-h` rather than `h`: on a genuinely short screen the content stays
 * readable and the page scrolls a little, which is far better than clipping the
 * send button off the bottom.
 *
 * The site footer still sits below this screen. That is deliberate — everything
 * on the contact page itself is visible at once, and the footer is where a
 * footer goes.
 */
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>
}) {
  const seoDoc = await getPageSEO('contact').catch(() => null)
  const { contact, social } = siteConfig
  // The plain form POST redirects back with ?sent=, so the page still confirms
  // a submission for anyone without JavaScript.
  const { sent } = await searchParams

  const inputClass =
    'w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-ring/30'
  const labelClass = 'mb-1.5 block text-xs font-medium text-muted-foreground'

  // Only the channels that are actually configured — an empty "Address" block
  // with a placeholder pin is worse than no block.
  const channels = [
    contact.email && {
      key: 'email',
      Icon: Mail,
      label: 'Email us',
      value: contact.email,
      href: `mailto:${contact.email}`,
    },
    contact.phone && {
      key: 'phone',
      Icon: Phone,
      label: 'Call us',
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s+/g, '')}`,
    },
    contact.address && {
      key: 'address',
      Icon: MapPin,
      label: 'Visit us',
      value: contact.address,
      href: undefined,
    },
  ].filter(Boolean) as {
    key: string
    Icon: typeof Mail
    label: string
    value: string
    href?: string
  }[]

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

      <section
        // Same treatment as PageHero and ServiceHero: pulled up under the
        // header and padded back down, so the glow starts at the top of the
        // window with the header transparent over it.
        data-header-transparent=""
        className="relative -mt-[var(--header-h)] flex min-h-svh items-center overflow-hidden pb-6 pt-[calc(var(--header-h)+1.5rem)] lg:pb-0 lg:pt-[var(--header-h)]"
      >
        {/* Background glow, carried over from the old hero so the page still
            feels part of the marketing site. Masked at the foot so the section's
            clip does not end it on a hard line. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-full w-full max-w-7xl -translate-x-1/2 [mask-image:linear-gradient(to_bottom,#000_0%,#000_62%,transparent_100%)]"
        >
          <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <div className="container w-full">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            {/* ── Left: who to talk to ───────────────────────────────────── */}
            <Reveal className="flex flex-col">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Contact
              </p>
              <h1 className="mt-1.5 text-2xl font-bold leading-[1.15] tracking-tight sm:text-4xl xl:text-5xl">
                Let&rsquo;s build something
                <span className="text-primary"> worth talking about.</span>
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-base">
                Tell us what you have in mind and we will come back to you within one business day.
              </p>

              <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:gap-2.5">
                {channels.map(({ key, Icon, label, value, href }) => {
                  const body = (
                    <>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                          {label}
                        </span>
                        <span className="block truncate whitespace-pre-line text-sm font-medium">
                          {value}
                        </span>
                      </span>
                    </>
                  )

                  return href ? (
                    <a
                      key={key}
                      href={href}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card/50 px-3.5 py-2.5 transition-colors hover:border-primary/40 hover:bg-card"
                    >
                      {body}
                    </a>
                  ) : (
                    <div
                      key={key}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card/50 px-3.5 py-2.5"
                    >
                      {body}
                    </div>
                  )
                })}
              </div>

              {social.length > 0 && (
                <div className="mt-4 flex items-center gap-4 sm:mt-6">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Follow
                  </span>
                  <div className="-mx-2 flex items-center">
                    {social.map((item) => {
                      const Icon = socialIcons[item.icon]
                      if (!Icon) return null
                      return (
                        <a
                          key={item.platform}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={item.platform}
                          className="p-2 transition-opacity hover:opacity-70"
                        >
                          <Icon size={22} />
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
            </Reveal>

            {/* ── Right: the form ────────────────────────────────────────── */}
            <Reveal
              delay={120}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:p-7"
            >
              {sent === '1' && (
                <p
                  role="status"
                  className="mb-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300"
                >
                  Thanks — we have your message and will reply within one business day.
                </p>
              )}
              {sent === 'error' && (
                <p
                  role="alert"
                  className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
                >
                  That did not go through. Please check your email address and try again.
                </p>
              )}

              <form action="/api/contact" method="POST" className="flex flex-col gap-3 sm:gap-4">
                <input type="hidden" name="kind" value="contact" />
                {/*
                 * Honeypot. Hidden from people, irresistible to naive bots; the
                 * intake route silently drops anything that fills it in.
                 * `tabIndex={-1}` and `aria-hidden` keep it away from keyboards
                 * and screen readers, which a `display:none` field would not
                 * reliably do for autofill.
                 */}
                <input
                  type="text"
                  name="website_url"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />
                {/* Name and email share a row so the form is four rows, not six —
                    the single biggest saving on a page that must not scroll. */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="name" className={labelClass}>
                      Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Your name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@company.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className={labelClass}>
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="What is this about?"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="message" className={labelClass}>
                    Message <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={3}
                    placeholder="Tell us about your project, timings and budget."
                    className={`${inputClass} min-h-20 resize-y sm:min-h-24`}
                  />
                </div>

                <button
                  type="submit"
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Send message
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>

                {/* Fine print, and the first thing to go on a very short phone —
                    the reply-time promise is already in the intro above. */}
                <p className="hidden text-center text-[11px] text-muted-foreground min-[400px]:block">
                  No newsletters, no sales sequences.
                </p>
              </form>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}
