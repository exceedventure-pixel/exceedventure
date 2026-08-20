import React from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowRight, type LucideIcon } from 'lucide-react'

import { cn } from '@/utilities/ui'
import { DrawnRule } from '@/components/DrawnRule'
import { OutlineWord } from '@/components/OutlineWord'
import type { ServiceColorTokens } from '@/components/ServiceDetail/colors'

/**
 * The site's page hero: the homepage's opening slide, made reusable.
 *
 * Same anatomy on every page — a tinted badge, a headline whose accent tail
 * carries a drawn rule, one sentence of recognition, the actions, and a tilted
 * card to the right of it all. The homepage's own loop keeps its separate
 * implementation because it animates between five of these; this is the still
 * version every other page gets.
 *
 * Colour comes in as a resolved token set rather than a key, so a caller can
 * pass a service's colour or the brand's without this needing to know which
 * exists. See `accentMap` in ServiceDetail/colors.
 *
 * Deliberately not a client component. `DrawnRule` is one — it needs an
 * observer to draw on scroll — but its children render on the server, so the
 * H1 is still static HTML and still paints before any JS arrives. That matters:
 * this is the largest text on every page on the site.
 */

export type HeroCta = { label: string; href: string }

export interface SplitHeroProps {
  /** Small uppercase label above the headline, in the accent colour. */
  badge: string
  icon: LucideIcon
  tokens: ServiceColorTokens
  /** The H1, minus its accented tail. */
  headline: React.ReactNode
  /** Accented tail of the H1. Gets the drawn rule under it. */
  headlineAccent?: React.ReactNode
  /** One sentence under the headline. */
  sub: React.ReactNode
  primaryCta: HeroCta
  secondaryCta?: HeroCta
  /** A few words under the buttons that remove the last hesitation. */
  reassurance?: string
  /** Rendered above everything, inside the section — breadcrumbs, usually. */
  breadcrumb?: React.ReactNode
  /** Anything extra in the left column, under the actions. */
  children?: React.ReactNode
  /** Full-width strip at the foot of the hero, under both columns. */
  footer?: React.ReactNode
  /** Overrides the word on the card's placeholder panel. Defaults to `badge`. */
  cardLabel?: string
  /** The H1's id, for the section's `aria-labelledby`. */
  headingId?: string
  /**
   * The hollow word across the foot of the hero. Defaults to the first word of
   * `badge` — "WordPress Development" gives "WORDPRESS" — which is the page's
   * own name often enough that most callers never set it. Pass it explicitly
   * when the first word is a filler like "Custom" or "Pay".
   */
  outlineWord?: string
}

export const SplitHero: React.FC<SplitHeroProps> = ({
  badge,
  icon: Icon,
  tokens,
  headline,
  headlineAccent,
  sub,
  primaryCta,
  secondaryCta,
  reassurance,
  breadcrumb,
  children,
  footer,
  cardLabel,
  headingId = 'page-hero-heading',
  outlineWord,
}) => (
  <section
    aria-labelledby={headingId}
    // The header watches for this and goes transparent while this screen is
    // behind it, solid from the next section on.
    data-header-transparent=""
    /*
     * Pulled up under the header by exactly its height, then padded back down
     * by the same amount: the wash starts at the top of the window with the
     * header floating on it, while the content stays optically centred in the
     * space below the header rather than in the whole viewport.
     */
    className="relative -mt-[var(--header-h)] flex min-h-svh flex-col justify-center overflow-hidden pb-20 pt-[var(--header-h)] sm:pb-24"
  >
    {/* Ambient light in the page's own colour. Masked to nothing before the
        bottom edge: the section clips its overflow, so without this the glow
        ends on a hard horizontal line exactly where the next section starts. */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,#000_0%,#000_58%,transparent_100%)]"
    >
      <div
        className={cn(
          'absolute left-1/2 top-1/3 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]',
          tokens.glow,
        )}
      />
      <div className="absolute left-[62%] top-[62%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 blur-[120px] dark:bg-secondary/15" />
    </div>

    {/*
     * The page's own name, hollow, across the foot of the hero — the same
     * backdrop lettering the homepage uses between its sections.
     *
     * Inside the hero rather than rising out of the section below it, because
     * this section clips its overflow to keep the glow off its neighbours. The
     * radial mask fades the word to nothing well before its edges anyway, so
     * sitting flush reads the same as bleeding past.
     */}
    <OutlineWord className="bottom-[6vh] -z-10">
      {outlineWord ?? badge.trim().split(' ')[0]}
    </OutlineWord>

    {breadcrumb}

    <div className="container">
      {/* No max-width of its own: the bare container is what the header uses,
          so the words start on the same line as the logo and the card ends on
          the same line as the header's buttons. */}
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        {/* Words. Centred while the halves are stacked, left-aligned the moment
            they sit side by side. Ordered second while stacked so the card
            leads on a phone. */}
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
              tokens.badge,
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {badge}
          </span>

          {/* clamp() rather than breakpoint steps, so the line grows
              continuously and lands at the same optical weight on any screen. */}
          <h1
            id={headingId}
            className="mt-5 text-balance font-semibold tracking-[-0.02em]"
            style={{ fontSize: 'clamp(1.75rem, 3.2vw, 3.15rem)', lineHeight: 1.08 }}
          >
            {headline}
            {headlineAccent && <DrawnRule className={tokens.accent}>{headlineAccent}</DrawnRule>}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
            {sub}
          </p>

          {/* Two paths out: one for people ready to talk, one for people still
              comparing. Losing the second group to a dead end is the most
              common way a single-button hero under-converts. */}
          <div className="mt-8 flex flex-col items-center gap-x-6 gap-y-3 sm:flex-row lg:items-start lg:justify-start">
            <Link
              href={primaryCta.href}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-medium shadow-lg transition-[background-color,box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2',
                tokens.cta,
                tokens.ctaText,
              )}
            >
              {primaryCta.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className={cn(
                  'group inline-flex min-h-11 items-center gap-1.5 px-2 py-3 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                  tokens.accent,
                )}
              >
                {secondaryCta.label}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            )}
          </div>

          {reassurance && <p className="mt-4 text-xs text-muted-foreground/80">{reassurance}</p>}

          {children}
        </div>

        {/* The card. Decorative in full — everything it says is already said to
            its left, and it is the one element here with nothing of its own. */}
        <div className="order-1 lg:order-2" aria-hidden="true">
          <div className="relative mx-auto w-full max-w-68 [perspective:1400px] sm:max-w-xs lg:max-w-xl">
            {/* Not a halo around the card — a single soft orb hung off its right
                edge, so the colour arrives from that side and falls away across
                the words. */}
            <div
              className={cn(
                'pointer-events-none absolute -right-[22%] top-1/2 -z-10 h-[145%] w-[95%] -translate-y-1/2 rounded-full opacity-90 blur-[80px]',
                tokens.glow,
              )}
            />

            <div
              className="relative aspect-square overflow-hidden rounded-3xl border border-border/70 bg-background shadow-2xl shadow-black/20 dark:shadow-black/50"
              // A constant yaw plus a slight roll: it reads as a card placed at
              // an angle rather than a picture pasted flat.
              style={{ transform: 'rotateY(-6deg) rotate(-5deg)' }}
            >
              <div className="relative flex h-full w-full flex-col items-center justify-center gap-4">
                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:2.25rem_2.25rem]" />
                <Icon className={cn('relative h-10 w-10 sm:h-14 sm:w-14', tokens.accent)} />
                <span className="relative px-6 text-center text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground sm:text-xs">
                  {cardLabel ?? badge}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {footer}
    </div>

    <div className="absolute bottom-10 left-1/2 -translate-x-1/2" aria-hidden="true">
      <span className="flex flex-col items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Scroll
        <ArrowDown className="hero-intro-nudge h-3.5 w-3.5" />
      </span>
    </div>
  </section>
)
