import React from 'react'
import Link from 'next/link'
import { ArrowRight, type LucideIcon } from 'lucide-react'

import { cn } from '@/utilities/ui'
import { colorMap, type ServiceColor } from './colors'

export interface ServiceCta {
  label: string
  href: string
}

export interface ServiceStat {
  /** The number or short fact — set at heading size, so keep it to a few characters. */
  value: string
  /** What the number means. */
  label: string
}

/**
 * Conversion copy for a service hero.
 *
 * Everything is optional. A page that supplies nothing still gets the layout,
 * filled from the props it already passes — so all service pages improve
 * without being edited, and the ones with real pain-point copy improve more.
 *
 * Every field here is deliberately short. The hero has one job: make someone
 * recognise their problem and click. Detail belongs in the sections below it.
 */
export interface ServiceHeroContent {
  /**
   * Overrides the page's `badge`. The original badges ("Sub Service",
   * "Specialist Service") describe the site's own taxonomy, which means nothing
   * to a visitor — name the category they were searching for instead.
   */
  badge?: string
  /**
   * The H1. Lead with the problem or the outcome and keep the target keyword in
   * it. The real limit is two lines at `lg:text-7xl`, which in practice means
   * about seven short words. Falls back to `titleLead` + `titleAccent`.
   */
  headline?: string
  /** Accented tail of the headline. Only used alongside `headline`. */
  headlineAccent?: string
  /**
   * One sentence, under eighty characters, that makes someone think "that's
   * me". Not a summary of the service — the sections below do that. Falls back
   * to `subtitle`.
   */
  pain?: string
  /**
   * Three short symptoms, set as a quiet row beneath the fold line. Fragments,
   * not sentences — they are scanned on the way past, not read.
   */
  symptoms?: string[]
  /** Main action. Name the thing they get, not the thing they do. */
  primaryCta?: ServiceCta
  /** Low-commitment alternative for people who are not ready to enquire. */
  secondaryCta?: ServiceCta
  /** A few words under the buttons that remove the last hesitation. */
  reassurance?: string
  /** Optional trust strip. Use real, verifiable numbers or leave it out. */
  stats?: ServiceStat[]
}

interface ServiceHeroProps extends ServiceHeroContent {
  color: ServiceColor
  icon: LucideIcon
  badge: string
  titleLead: string
  titleAccent: string
  subtitle: string
  /** Feature titles from the page's first section, used when `symptoms` is absent. */
  fallbackPoints?: string[]
  /** Breadcrumb trail, rendered inside the hero so it counts toward its height. */
  breadcrumb?: React.ReactNode
}

const DEFAULT_PRIMARY_CTA: ServiceCta = { label: 'Get a free quote', href: '/contact' }
const DEFAULT_SECONDARY_CTA: ServiceCta = { label: 'See pricing', href: '/pricing' }
const DEFAULT_REASSURANCE = 'Free, and no obligation.'

/**
 * Service page hero.
 *
 * One screen, centred, and almost empty on purpose. It carries four things and
 * nothing else: what this is, whether it is your problem, what to do, and why
 * that is safe. Everything else about the service — what's included, how it
 * works, what it costs — already has a section below, and lifting any of it up
 * here only buys a wall of text people skip.
 *
 * Sizing notes, because "one screen" is easy to get wrong:
 *
 *   - `svh`, not `vh`. On mobile `100vh` measures the viewport *without* the
 *     browser chrome, so a `vh`-sized hero overflows by exactly the height of
 *     the URL bar — guaranteeing the scroll it was meant to avoid.
 *   - `--header-h` is subtracted because the header is sticky, and the
 *     breadcrumb above this section takes roughly 3rem more.
 *   - `min-h` rather than `h`: on a short screen the content stays readable and
 *     the page scrolls a little, which beats clipping the buttons off.
 *
 * Two deliberate performance choices, both of which are also SEO choices:
 *
 *   1. No `Reveal` wrapper. `Reveal` renders its children at `opacity-0` until
 *      an IntersectionObserver fires after hydration, which for above-the-fold
 *      content means the largest text on the page cannot paint until the JS
 *      bundle has loaded and run — a self-inflicted LCP delay on every one of
 *      these pages.
 *   2. Nothing here is a client component, so the whole screen is static HTML.
 */
export const ServiceHero: React.FC<ServiceHeroProps> = ({
  color,
  icon: Icon,
  badge,
  titleLead,
  titleAccent,
  subtitle,
  headline,
  headlineAccent,
  pain,
  symptoms,
  primaryCta = DEFAULT_PRIMARY_CTA,
  secondaryCta = DEFAULT_SECONDARY_CTA,
  reassurance = DEFAULT_REASSURANCE,
  stats,
  fallbackPoints,
  breadcrumb,
}) => {
  const c = colorMap[color]

  // A page with no hero copy still gets a real hero: its own title, its own
  // subtitle as the opening line, and its feature cards as the closing row.
  const h1Lead = headline ?? titleLead
  const h1Accent = headline ? headlineAccent : titleAccent
  const painLine = pain ?? subtitle
  const points = symptoms?.length ? symptoms : (fallbackPoints ?? [])

  return (
    <section
      aria-labelledby="service-hero-heading"
      // Marks this as a hero the header may sit transparently on top of.
      data-header-transparent=""
      /*
       * Pulled up under the header, with the header's height folded into the
       * top padding at each breakpoint, so the accent wash starts at the top of
       * the window instead of on a hard line below the header. Full svh now
       * that it owns the header's strip as well.
       */
      className="relative -mt-[var(--header-h)] flex min-h-svh flex-col overflow-hidden border-b border-border/60 pb-6 pt-[calc(var(--header-h)+1.5rem)] sm:pb-8 sm:pt-[calc(var(--header-h)+2rem)] lg:pb-10 lg:pt-[calc(var(--header-h)+2.5rem)]"
    >
      {/* Decorative accent wash. Masked soft at the foot so the clip does not
          end it on a hard line where the next section starts. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,#000_0%,#000_65%,transparent_100%)]"
      >
        <div
          className={cn(
            'absolute left-1/2 top-[-30%] h-160 w-160 -translate-x-1/2 rounded-full blur-[140px]',
            c.glow,
          )}
        />
      </div>

      {breadcrumb}

      <div className="container flex flex-1 flex-col justify-center py-6 text-center sm:py-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center">
          <span
            className={cn(
              'inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]',
              c.accent,
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {badge}
          </span>

          <h1
            id="service-hero-heading"
            className="mt-6 text-balance text-3xl sm:mt-7 font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl [@media(max-height:820px)]:lg:text-5xl"
          >
            {h1Lead}
            {h1Accent && <span className={c.accent}>{h1Accent}</span>}
          </h1>

          <p className="mt-5 max-w-[40ch] sm:mt-7 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {painLine}
          </p>

          {/* Two paths out: one for people ready to talk, one for people still
              comparing. Losing the second group to a dead end is the most
              common way a single-button hero under-converts. */}
          <div className="mt-8 flex flex-col items-center gap-x-8 gap-y-4 sm:mt-10 sm:flex-row">
            <Link
              href={primaryCta.href}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-medium shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2',
                c.cta,
                c.ctaText,
              )}
            >
              {primaryCta.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href={secondaryCta.href}
              className={cn(
                'group inline-flex min-h-11 items-center gap-1.5 px-5 py-3 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                c.accent,
              )}
            >
              {secondaryCta.label}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          {reassurance && (
            <p className="mt-5 text-xs text-muted-foreground/80 sm:mt-6">{reassurance}</p>
          )}

          {stats && stats.length > 0 && (
            <dl className="mt-12 flex flex-wrap justify-center gap-x-14 gap-y-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className={cn('text-3xl font-semibold leading-none', c.accent)}>
                    {stat.value}
                  </dt>
                  <dd className="mt-2 text-xs text-muted-foreground">{stat.label}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      {/* Recognition, sat at the foot of the screen so it reads as a footnote to
          the statement above rather than competing with it. */}
      {points.length > 0 && (
        <div className="container">
          <ul className="mx-auto grid max-w-sm gap-4 border-t border-border/60 pt-6 sm:max-w-5xl sm:pt-8 sm:grid-cols-3 sm:gap-10">
            {points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
              >
                <span
                  className={cn('mt-2 h-1.5 w-1.5 shrink-0 rounded-full', c.dot)}
                  aria-hidden="true"
                />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default ServiceHero
