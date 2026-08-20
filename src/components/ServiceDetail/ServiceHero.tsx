import React from 'react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/utilities/ui'
import { colorMap, type ServiceColor } from './colors'
import { SplitHero } from '@/components/SplitHero'

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
   * Three short symptoms. **No longer rendered** — the hero used to close on a
   * hairline rule and a row of these, and that strip was removed. The field is
   * kept because 76 pages still supply real copy for it; if nothing adopts it,
   * strip it from those pages rather than leaving it to rot here.
   */
  symptoms?: string[]
  /** Main action. Name the thing they get, not the thing they do. */
  primaryCta?: ServiceCta
  /** Low-commitment alternative for people who are not ready to enquire. */
  secondaryCta?: ServiceCta
  /**
   * A few words under the buttons that remove the last hesitation. No default
   * any more: every page that did not set one was showing "Free, and no
   * obligation.", and pages with something specific to say still say it.
   */
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
  /** Feature titles from the page's first section. Unused since the symptom
   *  strip was removed — see `symptoms`. */
  fallbackPoints?: string[]
  /** Breadcrumb trail, rendered inside the hero so it counts toward its height. */
  breadcrumb?: React.ReactNode
}

const DEFAULT_PRIMARY_CTA: ServiceCta = { label: 'Get a free quote', href: '/contact' }
const DEFAULT_SECONDARY_CTA: ServiceCta = { label: 'See pricing', href: '/pricing' }

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
  primaryCta = DEFAULT_PRIMARY_CTA,
  secondaryCta = DEFAULT_SECONDARY_CTA,
  reassurance,
  stats,
  breadcrumb,
}) => {
  const c = colorMap[color]

  // A page with no hero copy still gets a real hero: its own title, its own
  // subtitle as the opening line, and its feature cards as the closing row.
  const h1Lead = headline ?? titleLead
  const h1Accent = headline ? headlineAccent : titleAccent
  const painLine = pain ?? subtitle

  return (
    <SplitHero
      headingId="service-hero-heading"
      badge={badge}
      icon={Icon}
      tokens={c}
      headline={h1Lead}
      headlineAccent={h1Accent}
      sub={painLine}
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
      reassurance={reassurance}
      breadcrumb={breadcrumb}
    >
      {stats && stats.length > 0 && (
        <dl className="mt-10 flex flex-wrap justify-center gap-x-10 gap-y-5 lg:justify-start">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className={cn('text-2xl font-semibold leading-none sm:text-3xl', c.accent)}>
                {stat.value}
              </dt>
              <dd className="mt-1.5 text-xs text-muted-foreground">{stat.label}</dd>
            </div>
          ))}
        </dl>
      )}
    </SplitHero>
  )
}

export default ServiceHero
