'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Globe,
  Bot,
  Megaphone,
  Palette,
  Target,
  FileText,
  Rocket,
  Shield,
  Users,
  TrendingUp,
  BarChart3,
  Brain,
  Workflow,
  Heart,
  Clock,
  Briefcase,
  type LucideIcon,
} from 'lucide-react'

import { HeroIntro } from '@/components/HeroIntro'
import { useAccent } from '@/providers/Accent'
import { cn } from '@/utilities/ui'
import { Reveal } from '@/components/Reveal'
import { StackedCarousel } from '@/components/StackedCarousel'
import { WebsiteShowcaseSection } from '@/components/WebsiteShowcase'
import type { ShowcaseItem } from '@/components/WebsiteShowcase/types'
import { TestimonialsSection } from '@/components/Testimonials'
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

// ─── Static content ───────────────────────────────────────────────────────────
const services: {
  title: string
  titleAccent: string
  icon: LucideIcon
  color: string
  href: string
}[] = [
  {
    title: 'WEBSITES',
    titleAccent: '& SOFTWARES',
    icon: Globe,
    color: 'teal',
    href: '/websites-softwares',
  },
  {
    title: 'DIGITAL',
    titleAccent: 'MARKETING',
    icon: Megaphone,
    color: 'blue',
    href: '/digital-marketing',
  },
  { title: 'AUTOMATION', titleAccent: '& AI', icon: Bot, color: 'red', href: '/automation-ai' },
  {
    title: 'CREATIVE',
    titleAccent: '& BRANDING',
    icon: Palette,
    color: 'purple',
    href: '/creative-branding',
  },
]

const colorClasses: Record<string, { bg: string; hover: string; text: string }> = {
  teal: { bg: 'bg-teal-500/10', hover: 'hover:border-teal-500/40', text: 'text-teal-500' },
  red: { bg: 'bg-red-500/10', hover: 'hover:border-red-500/40', text: 'text-red-500' },
  blue: { bg: 'bg-blue-500/10', hover: 'hover:border-blue-500/40', text: 'text-blue-500' },
  purple: { bg: 'bg-purple-500/10', hover: 'hover:border-purple-500/40', text: 'text-purple-500' },
  emerald: {
    bg: 'bg-emerald-500/10',
    hover: 'hover:border-emerald-500/40',
    text: 'text-emerald-500',
  },
  amber: { bg: 'bg-amber-500/10', hover: 'hover:border-amber-500/40', text: 'text-amber-500' },
  pink: { bg: 'bg-pink-500/10', hover: 'hover:border-pink-500/40', text: 'text-pink-500' },
  indigo: { bg: 'bg-indigo-500/10', hover: 'hover:border-indigo-500/40', text: 'text-indigo-500' },
}

// Breakdown behind the headline "50+ projects" figure. Placeholder split —
// adjust the counts to the real numbers.
const projectTypes: { label: string; count: number }[] = [
  { label: 'Websites & Systems', count: 18 },
  { label: 'Creative & Branding', count: 14 },
  { label: 'Media Campaigns', count: 11 },
  { label: 'Automation & AI', count: 7 },
]

const features: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Rocket, title: 'Fast Delivery', description: 'We deliver projects on time, every time.' },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security for your peace of mind.',
  },
  { icon: Users, title: 'Dedicated Support', description: 'A team that cares about your success.' },
  {
    icon: TrendingUp,
    title: 'Growth Focused',
    description: 'Solutions designed to help you scale.',
  },
]

const ventures = [
  {
    name: 'Softal Core',
    light: '/assets/softal-core.svg',
    dark: '/assets/dark-softal-core.svg',
    href: 'https://softalcore.exceedventure.com',
    description: 'Software Solutions',
  },
  {
    name: 'Corporate Crafts',
    light: '/assets/corporate-crafts.svg',
    dark: '/assets/dark-corporate-crafts.svg',
    href: 'https://corporatecrafts.exceedventure.com',
    description: 'Corporate Branding',
  },
  {
    name: 'Create a Content',
    light: '/assets/createacontent.svg',
    dark: '/assets/dark-createacontent.svg',
    href: 'https://createacontent.exceedventure.com',
    description: 'Content Marketing',
  },
]

const dashboardItems: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Monitor metrics in real-time' },
  { icon: Brain, title: 'AI Insights', desc: 'Smart recommendations' },
  { icon: Workflow, title: 'Automation', desc: 'Automate repetitive tasks' },
]

// ─── Stats bento ──────────────────────────────────────────────────────────────

/** Shared card chrome: solid fill, generous radius, lift on hover. */
const statCard =
  'group relative flex flex-col justify-between overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-6 lg:p-7'

/** Small/large card heights — the bento keeps its shape down to mobile. */
const cardSm = 'min-h-[148px] sm:min-h-[190px]'
const cardLg = 'min-h-[320px] sm:min-h-[396px]'

/**
 * Card fills are the brand hexes rather than the `primary`/`secondary` tokens on
 * purpose: those two swap places in dark mode, which would reshuffle the bento's
 * colours between themes. Fixed values keep this section looking identical in both.
 */
const NAVY = 'bg-[#15246d]'
const TEAL = 'bg-[#00c2be]'

const StatsSection: React.FC = () => {
  const [barsRef, barsInView] = useInView<HTMLDivElement>(0.25)
  const maxCount = Math.max(...projectTypes.map((p) => p.count))
  const totalProjects = projectTypes.reduce((sum, p) => sum + p.count, 0)

  return (
    <section className="bg-muted/30 py-20">
      <div className="container">
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-12">
          {/* ── Left cluster: two small cards over one wide card.
              grid-cols-2 is unprefixed so the pair stays side by side on mobile. ── */}
          <div className="grid gap-3 sm:gap-4 lg:col-span-7 lg:grid-rows-2">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Client satisfaction */}
              <Reveal>
                <div className={`${statCard} ${TEAL} ${cardSm} h-full text-black`}>
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150" />
                  <Heart className="h-5 w-5 opacity-80 sm:h-6 sm:w-6" />
                  <div>
                    <div className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                      <AnimatedCounter end={98} suffix="%" />
                    </div>
                    <div className="mt-1 text-xs font-medium opacity-80 sm:text-sm">
                      Client Satisfaction
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Support */}
              <Reveal delay={80}>
                <div className={`${statCard} ${cardSm} h-full bg-emerald-600 text-white`}>
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150" />
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                    </span>
                    <span className="text-xs font-medium opacity-90">Online now</span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                      <AnimatedCounter end={24} suffix="/7" />
                    </div>
                    <div className="mt-1 text-xs font-medium opacity-80 sm:text-sm">
                      Support Available
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Experience — wide card */}
            <Reveal delay={160}>
              <div
                className={`${statCard} ${cardSm} h-full flex-row items-end justify-between gap-4 bg-violet-600 text-white`}
              >
                <div className="absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-white/5 transition-transform duration-500 group-hover:scale-150" />
                <div className="relative">
                  <Clock className="mb-3 h-5 w-5 opacity-80 sm:mb-4 sm:h-6 sm:w-6" />
                  <div className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    <AnimatedCounter end={10} suffix="+" />
                  </div>
                  <div className="mt-1 text-xs font-medium leading-snug opacity-80 sm:text-sm">
                    Years Combined Experience
                  </div>
                </div>

                <div className="relative flex shrink-0 gap-4 sm:gap-6">
                  <div>
                    <div className="text-xl font-bold sm:text-2xl">
                      <AnimatedCounter end={4} />
                    </div>
                    <div className="text-[10px] opacity-70 sm:text-xs">Disciplines</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold sm:text-2xl">
                      <AnimatedCounter end={3} />
                    </div>
                    <div className="text-[10px] opacity-70 sm:text-xs">Branches</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* ── Right: tall card with the project-type breakdown ── */}
          <Reveal delay={240} className="lg:col-span-5">
            <div ref={barsRef} className={`${statCard} ${NAVY} ${cardLg} h-full text-white`}>
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 transition-transform duration-500 group-hover:scale-125" />

              <div className="relative">
                <div className="flex items-center gap-2 text-xs font-medium opacity-70">
                  <Briefcase className="h-4 w-4" />
                  Delivered to date
                </div>
                <div className="mt-3 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                  <AnimatedCounter end={50} suffix="+" />
                </div>
                <div className="mt-1 text-sm font-medium opacity-80">Projects Delivered</div>
              </div>

              {/* Breakdown by type — bars fill once scrolled into view */}
              <div className="relative mt-8 space-y-3.5">
                {projectTypes.map((type, i) => (
                  <div key={type.label}>
                    <div className="mb-1.5 flex items-baseline justify-between text-xs">
                      <span className="font-medium opacity-90">{type.label}</span>
                      <span className="font-bold tabular-nums opacity-70">{type.count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                      <div
                        className={`h-full rounded-full ${TEAL} transition-[width] duration-1000 ease-out`}
                        style={{
                          width: barsInView ? `${(type.count / maxCount) * 100}%` : '0%',
                          transitionDelay: `${i * 120}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-1 text-xs opacity-60">
                  {totalProjects} tracked across {projectTypes.length} service lines
                </div>
              </div>
            </div>
          </Reveal>
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
  /*
   * The main CTA wears whatever colour the page is currently wearing. In
   * practice that is the brand navy by the time anyone has scrolled down to it
   * — the opening loop hands the accent back as soon as it leaves the screen —
   * but it means this button can never be the one thing left in the wrong
   * colour when it is on screen alongside a coloured wash.
   */
  const { tokens } = useAccent()

  return (
    <>
      {/* Opening screen — one sentence at a time, cycling through what we do.
          Everything below is unchanged; this simply arrives before it.

          Deliberately outside the wrapper below: `overflow-x-hidden` computes
          to `overflow: hidden auto`, which clips this section's negative top
          margin and cut its gradient off in a hard line at the header. */}
      <HeroIntro />

      {/* Social proof, straight off the back of the opening loop. Outside the
          wrapper below for the same reason the hero is: `overflow-x-hidden`
          resolves to `overflow: hidden auto`, and this section's own vertical
          mask is easier to reason about outside that scroll container. */}
      <TestimonialsSection items={testimonials} />

      <div className="min-h-screen overflow-x-hidden">
        {/* Hero */}
        {/* At least one screen tall, but no longer squeezed into exactly one:
          the carousel, the headline and the service cards each get room to
          breathe and the section grows past the fold if it needs to. svh rather
          than vh so mobile browser chrome doesn't push the cards off. */}
        <section className="relative flex flex-col items-center justify-center bg-white py-14 text-center dark:bg-transparent sm:bg-transparent sm:py-20 lg:py-24">
          <Reveal className="container z-10 flex w-full flex-col items-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
              <span>Ready to go </span>
              <span className={tokens.accent}>online?</span>
            </h1>

            <div className="mb-10 mt-7 flex flex-row gap-2 sm:mb-14 sm:gap-3">
              <Link
                href="/contact"
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-base font-medium shadow-lg transition-colors duration-500',
                  tokens.cta,
                  tokens.ctaText,
                )}
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

            <div className="grid w-full max-w-6xl grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {services.map((service) => {
                const Icon = service.icon
                const colors = colorClasses[service.color]
                return (
                  <Link
                    key={service.title}
                    href={service.href}
                    className={`group block h-full rounded-xl border border-border bg-card p-5 text-center transition-all hover:-translate-y-1 sm:p-7 ${colors.hover}`}
                  >
                    <div
                      className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg sm:mb-4 sm:h-12 sm:w-12 ${colors.bg}`}
                    >
                      <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${colors.text}`} />
                    </div>
                    <h3 className="text-sm font-bold leading-tight sm:text-lg">
                      <span className="block">{service.title}</span>
                      <span className="block font-light opacity-80">{service.titleAccent}</span>
                    </h3>
                  </Link>
                )
              })}
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

        {/* Website showcase — live client sites in a three-column grid, one card
          scrolling itself at a time and everything holding still while a
          pointer is in the grid. Managed in the CMS; renders nothing at all
          when none are published, so the hero flows straight into the stats as
          it did before. */}
        <WebsiteShowcaseSection items={showcase} />

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
          className="relative pb-20 pt-10 sm:pb-28 sm:pt-14 lg:pb-32 lg:pt-16"
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

        {/* Features */}
        <section className="py-16 sm:py-24">
          <div className="container">
            <Reveal className="mb-10 sm:mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold sm:text-5xl">Why Choose Us?</h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                We combine creativity with technology to deliver results.
              </p>
            </Reveal>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 [&>*:last-child:nth-child(odd)]:col-span-2 sm:[&>*:last-child:nth-child(odd)]:col-span-1">
              {features.map((feature, i) => {
                const Icon = feature.icon
                return (
                  <Reveal
                    key={feature.title}
                    delay={i * 80}
                    className="h-full rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:shadow-lg sm:p-6"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 sm:mb-4 sm:h-12 sm:w-12">
                      <Icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                    </div>
                    <h3 className="mb-1.5 text-sm font-bold leading-snug sm:mb-2 sm:text-lg">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {feature.description}
                    </p>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* Dashboard */}
        <section className="bg-linear-to-br from-primary/5 via-transparent to-secondary/5 py-16 sm:py-24">
          <div className="container">
            <Reveal className="mb-10 sm:mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold sm:text-5xl">Powerful Dashboard</h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Get real-time insights and make data-driven decisions.
              </p>
            </Reveal>
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <Reveal className="space-y-6">
                {dashboardItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.title}
                      className="flex gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/20"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="mb-1 font-bold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </Reveal>
              <Reveal delay={120} className="relative">
                <div className="overflow-hidden rounded-2xl border border-border shadow-2xl">
                  <Image
                    src="/assets/home-page-01.svg"
                    alt="Dashboard"
                    className="h-auto w-full"
                    width={600}
                    height={400}
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Ventures */}
        <section className="py-16 sm:py-24">
          <div className="container">
            <Reveal className="mb-10 sm:mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold sm:text-5xl">Our Branches</h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Specialized branches delivering excellence.
              </p>
            </Reveal>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 [&>*:last-child:nth-child(odd)]:col-span-2 md:[&>*:last-child:nth-child(odd)]:col-span-1">
              {ventures.map((venture, i) => (
                <Reveal key={venture.name} delay={i * 80} className="h-full">
                  <a
                    href={venture.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col rounded-2xl border border-border bg-card p-4 text-center transition-all hover:border-primary/30 hover:shadow-xl sm:p-8"
                  >
                    <div className="mb-3 flex h-10 items-center justify-center sm:mb-4 sm:h-16">
                      <Image
                        src={venture.light}
                        alt={venture.name}
                        className="h-8 w-auto transition-transform group-hover:scale-105 sm:h-12 dark:hidden"
                        width={120}
                        height={48}
                      />
                      <Image
                        src={venture.dark}
                        alt={venture.name}
                        className="hidden h-8 w-auto transition-transform group-hover:scale-105 sm:h-12 dark:block"
                        width={120}
                        height={48}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {venture.description}
                    </p>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-linear-to-r from-primary to-accent py-16 sm:py-24">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <Reveal>
                <h2 className="mb-6 text-3xl font-bold text-white sm:text-5xl">
                  Ready to Exceed Your Goals?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
                  Let us work together to build something amazing.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 text-lg font-medium text-primary shadow-lg transition-colors hover:bg-white/90"
                  >
                    Get Started <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center rounded-xl border border-white px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Learn More
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
