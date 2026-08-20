'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, FileText, Heart, Clock, Briefcase, type LucideIcon } from 'lucide-react'

import { HeroIntro } from '@/components/HeroIntro'
import { Reveal } from '@/components/Reveal'
import { StackedCarousel } from '@/components/StackedCarousel'
import { WebsiteShowcaseSection } from '@/components/WebsiteShowcase'
import type { ShowcaseItem } from '@/components/WebsiteShowcase/types'
import { TestimonialsSection } from '@/components/Testimonials'
import { WhatWeDoGrid } from '@/components/WhatWeDo'
import { LetsTalkSection } from '@/components/LetsTalk'
import { OutlineWord } from '@/components/OutlineWord'
import type { Testimonial } from '@/components/Testimonials/types'

// ─── Animated counter (dependency-free) ──────────────────────────────────────
const AnimatedCounter = ({
  end,
  duration = 2,
  suffix = '',
}: {
  end: number
  duration?: number
  suffix?: string
}) => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    let startTime: number
    let frame: number
    const animate = (t: number) => {
      if (!startTime) startTime = t
      const progress = (t - startTime) / (duration * 1000)
      if (progress < 1) {
        setCount(Math.floor(end * progress))
        frame = requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [started, end, duration])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

/** Fires once when the element scrolls into view — drives the stat bar fills. */
function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView] as const
}

// Breakdown behind the headline "50+ projects" figure. Placeholder split —
// adjust the counts to the real numbers.
const projectTypes: { label: string; count: number }[] = [
  { label: 'Websites & Systems', count: 18 },
  { label: 'Creative & Branding', count: 14 },
  { label: 'Media Campaigns', count: 11 },
  { label: 'Automation & AI', count: 7 },
]

/**
 * The reasons, as a numbered spec sheet rather than a row of icon cards.
 *
 * Four boxes with a tinted glyph in each is the shape this page already uses
 * twice — the bento and the stats — and a third run of it read as filler. A
 * numbered list with hairline rules is the one editorial device here, which is
 * what makes these read as claims being made rather than as more tiles.
 */
const reasons: { title: string; description: string }[] = [
  {
    title: 'Fast delivery',
    description: 'Dates given in the first meeting are the dates we launch on.',
  },
  {
    title: 'Secure and reliable',
    description: 'Enterprise-grade hosting, backups and updates, handled quietly.',
  },
  {
    title: 'Dedicated support',
    description: 'We do not vanish at launch. Small things get fixed the same day.',
  },
  {
    title: 'Growth focused',
    description: 'Built to be added to, so the site grows with you rather than against you.',
  },
]

// ─── Stats bento ──────────────────────────────────────────────────────────────

/** Shared card chrome: solid fill, generous radius, lift on hover. */
/*
 * The same chrome the "what we do" bento uses, for the same reason: an alpha
 * tint of `foreground` is one step off whatever the background is, in either
 * theme, without a single fixed colour.
 *
 * Monochrome on purpose. Four saturated fills — teal, emerald, violet, navy —
 * made this the loudest thing on a page whose accent already changes per
 * service, and the colours carried no meaning: they were not keyed to anything,
 * so they read as decoration competing with the numbers.
 */
const statCard =
  'group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-foreground/[0.04] p-4 ring-1 ring-foreground/[0.07] transition-[background-color,box-shadow] duration-300 hover:bg-foreground/[0.07] hover:shadow-xl hover:shadow-foreground/5 sm:p-5 dark:bg-white/[0.06] dark:ring-white/[0.07] dark:hover:bg-white/[0.1]'

/** Small/large card heights. Trimmed — the old ones ran a third taller. */
const cardSm = 'min-h-[118px] sm:min-h-[142px]'
const cardLg = 'min-h-[256px] sm:min-h-[300px]'

/** The one accent left: the fill on the breakdown bars, so they read as data. */
const BAR = 'bg-primary dark:bg-secondary'

const StatsSection: React.FC = () => {
  const [barsRef, barsInView] = useInView<HTMLDivElement>(0.25)
  const maxCount = Math.max(...projectTypes.map((p) => p.count))
  const totalProjects = projectTypes.reduce((sum, p) => sum + p.count, 0)

  return (
    <section className="bg-muted/30 py-16 sm:py-20" aria-labelledby="numbers-heading">
      <div className="container">
        {/* Same inner box and left edge as the pitch section above, so the two
            bentos line up rather than each finding their own margin. */}
        <div className="mx-auto w-full max-w-6xl">
          <Reveal className="mb-8 sm:mb-10">
            <h2
              id="numbers-heading"
              className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
            >
              The numbers <span className="text-primary">behind it</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              What we have delivered, who we have delivered it for, and how long we have been at it.
            </p>
          </Reveal>

          <div className="grid gap-3 sm:gap-4 lg:grid-cols-12">
            {/* ── Left cluster: two small cards over one wide card.
              grid-cols-2 is unprefixed so the pair stays side by side on mobile. ── */}
            <div className="grid gap-3 sm:gap-4 lg:col-span-7 lg:grid-rows-2">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Client satisfaction */}
                <Reveal>
                  <div className={`${statCard} ${cardSm} h-full`}>
                    <Heart className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
                    <div>
                      <div className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                        <AnimatedCounter end={98} suffix="%" />
                      </div>
                      <div className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                        Client Satisfaction
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* Support */}
                <Reveal delay={80}>
                  <div className={`${statCard} ${cardSm} h-full`}>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">Online now</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                        <AnimatedCounter end={24} suffix="/7" />
                      </div>
                      <div className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                        Support Available
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* Experience — wide card */}
              <Reveal delay={160}>
                <div
                  className={`${statCard} ${cardSm} h-full flex-row items-end justify-between gap-4`}
                >
                  <div className="relative">
                    <Clock className="mb-3 h-4 w-4 text-muted-foreground sm:mb-4 sm:h-5 sm:w-5" />
                    <div className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                      <AnimatedCounter end={10} suffix="+" />
                    </div>
                    <div className="mt-1 text-xs font-medium leading-snug text-muted-foreground sm:text-sm">
                      Years Combined Experience
                    </div>
                  </div>

                  <div className="relative flex shrink-0 gap-4 sm:gap-6">
                    <div>
                      <div className="text-xl font-bold sm:text-2xl">
                        <AnimatedCounter end={4} />
                      </div>
                      <div className="text-[10px] text-muted-foreground sm:text-xs">
                        Disciplines
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* ── Right: tall card with the project-type breakdown ── */}
            <Reveal delay={240} className="lg:col-span-5">
              <div ref={barsRef} className={`${statCard} ${cardLg} h-full`}>
                <div className="relative">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    Delivered to date
                  </div>
                  <div className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                    <AnimatedCounter end={50} suffix="+" />
                  </div>
                  <div className="mt-1 text-sm font-medium text-muted-foreground">
                    Projects Delivered
                  </div>
                </div>

                {/* Breakdown by type — bars fill once scrolled into view */}
                <div className="relative mt-6 space-y-3">
                  {projectTypes.map((type, i) => (
                    <div key={type.label}>
                      <div className="mb-1.5 flex items-baseline justify-between text-xs">
                        <span className="font-medium">{type.label}</span>
                        <span className="font-bold tabular-nums text-muted-foreground">
                          {type.count}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                        <div
                          className={`h-full rounded-full ${BAR} transition-[width] duration-1000 ease-out`}
                          style={{
                            width: barsInView ? `${(type.count / maxCount) * 100}%` : '0%',
                            transitionDelay: `${i * 120}ms`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-1 text-xs text-muted-foreground">
                    {totalProjects} tracked across {projectTypes.length} service lines
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Both lists default to empty so the page still renders without the props. */
export default function HomeClient({
  showcase = [],
  testimonials = [],
}: {
  showcase?: ShowcaseItem[]
  testimonials?: Testimonial[]
}) {
  return (
    <>
      {/* Opening screen — one sentence at a time, cycling through what we do.
          Everything below is unchanged; this simply arrives before it.

          Deliberately outside the wrapper below: `overflow-x-hidden` computes
          to `overflow: hidden auto`, which clips this section's negative top
          margin and cut its gradient off in a hard line at the header. */}
      <HeroIntro />

      {/*
       * `overflow-x-clip`, not `-hidden`. Both stop the reviews' columns and
       * the carousel's fly-in from widening the page, but `hidden` on one axis
       * forces the other to `auto` — which made this a scroll container and cut
       * off anything a child placed above its top edge. The showcase's backdrop
       * lettering needs to rise into the hero, and `clip` is the one value that
       * leaves the vertical axis visible.
       */}
      <div className="min-h-screen overflow-x-clip">
        {/* Website showcase — live client sites, four across on a desktop, with
          three of them touring themselves at a time and the one under the
          pointer held still. Opens the page under the hero now, so the work
          makes the case before anything is claimed about it. Managed in the
          CMS; renders nothing at all when none are published, in which case the
          hero flows straight into the pitch below. */}
        <WebsiteShowcaseSection items={showcase} />

        {/* The pitch, after the proof. */}
        {/* At least one screen tall, but no longer squeezed into exactly one:
          the carousel, the headline and the service cards each get room to
          breathe and the section grows past the fold if it needs to. svh rather
          than vh so mobile browser chrome doesn't push the cards off. */}
        <section className="relative flex flex-col items-center justify-center bg-white py-14 text-left dark:bg-transparent sm:bg-transparent sm:py-20 lg:py-24">
          {/* `z-0`, not `-z-10` like the showcase's: this section paints its own
              white background below `sm`, and a negative layer would sit behind
              that rather than on it. The content above already carries `z-10`. */}
          <OutlineWord className="-top-[12vw] z-0">ONLINE</OutlineWord>

          {/* One inner box at the bento's own width, holding the heading, the
              buttons and the grid. They all share its left edge — with the
              heading centred in the container and the grid capped at max-w-6xl,
              the two started at different places on any screen wide enough for
              the cap to bite. */}
          <Reveal className="container z-10 flex w-full flex-col items-center">
            <div className="mx-auto w-full max-w-6xl">
              {/* Deliberately outside the live accent, unlike the button below
                it: this is the page's h1, and a heading that changes colour
                depending on which hero slide happened to be showing reads as a
                glitch rather than as a theme. `text-primary` is navy on light
                and the teal on dark, both fixed. */}
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
                <span>Ready to go </span>
                <span className="text-primary">online?</span>
              </h1>

              <div className="mb-10 mt-7 flex flex-row gap-2 sm:mb-14 sm:gap-3">
                {/* Fixed brand fill, like the heading above it. This section is
                  the page's own pitch, not a service's, so it keeps the brand
                  colour whatever the hero happens to be wearing. */}
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-base font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
                >
                  Start a Project <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/our-works"
                  className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-2.5 text-base font-medium transition-colors hover:bg-muted"
                >
                  View Our Work
                </Link>
              </div>

              {/* The bento, in place of the four flat service cards that were here.
                Same four services and two more besides, in shapes that say which
                of them carries the most weight. */}
              <WhatWeDoGrid />
            </div>
          </Reveal>

          {/* Background glow. Masked soft at both ends: the orbs are positioned to
            overhang the section, so the clip would otherwise end them on a hard
            line at each boundary. */}
          <div className="pointer-events-none absolute right-0 top-0 -z-10 h-full w-full overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,#000_18%,#000_82%,transparent_100%)]">
            <div className="absolute right-[-5%] top-[-10%] h-125 w-125 rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-5%] h-100 w-100 rounded-full bg-secondary/10 blur-[100px]" />
          </div>
        </section>

        {/* Social proof, straight off the back of the work it is about — the
            live sites are directly above it, so the quotes have a subject.

            Inside the wrapper, unlike the hero: its columns start well outside
            their own box on the way in, and the wrapper's `overflow-x-hidden`
            is what keeps that off the page's scroll width. */}
        <TestimonialsSection items={testimonials} />

        {/*
         * Our work — the cards fly in from both edges and assemble into the
         * stack the first time this scrolls into view.
         *
         * Given a whole screen's worth of room rather than being tucked under
         * something else: the assembly is the most deliberate piece of motion
         * on the page and it needs air above and below to land, and the wings
         * start two thirds of a viewport out to each side, which only reads as
         * "flying in" if there is nothing crowding the edges.
         */}
        <section
          // Light on top: the showcase above already ends in a deep
          // pb-24/32/40, so the two pads were stacking into a gap wider than
          // either section meant on its own.
          className="relative pb-20 pt-4 sm:pb-28 sm:pt-6 lg:pb-32 lg:pt-8"
          aria-labelledby="our-work-heading"
        >
          <div className="container">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Our work
              </span>
              <h2
                id="our-work-heading"
                className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
              >
                A look at what we <span className="text-primary">make</span>
              </h2>
            </Reveal>
          </div>

          {/* Outside the container so the stack stays full-bleed. The dots hang
              56px below the track, which is what the foot padding clears. */}
          <div className="mt-16 w-full pb-20 sm:mt-20">
            <StackedCarousel />
          </div>
        </section>

        {/* Stats — bento grid: two small cards + a wide one on the left,
          one tall card on the right carrying the project breakdown. */}
        <StatsSection />

        {/* Why us — the numbered sheet. */}
        <section className="py-16 sm:py-20" aria-labelledby="why-us-heading">
          <div className="container">
            {/* Same inner box and left edge as the pitch and the stats above. */}
            <div className="mx-auto w-full max-w-6xl">
              <Reveal className="mb-10 sm:mb-14">
                <h2
                  id="why-us-heading"
                  className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
                >
                  Why teams <span className="text-primary">stay</span>
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Four things clients tell us they did not get last time.
                </p>
              </Reveal>

              {/*
               * A rule above every row and one under the last, so the set reads
               * as a sheet rather than as four separated bars. The numeral sits
               * in its own column at every width — it is the thing the eye
               * tracks down, and letting it reflow under the title on mobile
               * would lose the spine the whole layout hangs on.
               */}
              <ul className="border-b border-border">
                {reasons.map((reason, i) => (
                  <Reveal key={reason.title} delay={Math.min(i * 70, 280)}>
                    <li className="group grid grid-cols-[auto_1fr] items-baseline gap-x-5 border-t border-border py-6 transition-colors duration-300 hover:bg-foreground/[0.02] sm:grid-cols-[auto_minmax(0,18rem)_1fr] sm:gap-x-8 sm:py-7">
                      <span className="font-mono text-sm tabular-nums text-muted-foreground/60 transition-colors duration-300 group-hover:text-primary">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-base font-semibold tracking-[-0.01em] sm:text-lg">
                        {reason.title}
                      </h3>
                      <p className="col-start-2 mt-2 text-sm leading-relaxed text-muted-foreground sm:col-start-3 sm:mt-0">
                        {reason.description}
                      </p>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* The ask, once the reasons have been given. */}
        <LetsTalkSection />
      </div>
    </>
  )
}
