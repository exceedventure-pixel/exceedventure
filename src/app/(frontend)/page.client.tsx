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

import { Reveal } from '@/components/Reveal'
import { StackedCarousel } from '@/components/StackedCarousel'

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

export default function HomeClient() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero */}
      {/* Sized to one screen: everything from the carousel to the service cards
          should be visible on first load without scrolling. svh rather than vh
          so mobile browser chrome doesn't push the cards off. */}
      <section className="relative flex min-h-[calc(100svh-var(--header-h))] flex-col items-center justify-center bg-white pb-4 pt-2 text-center dark:bg-transparent sm:bg-transparent lg:pb-6 lg:pt-2">
        {/* Stacked carousel — kept outside the container so it stays full-bleed.
            The negative margin absorbs most of the carousel's own md:py-12 on
            larger screens; mobile is left alone since it only has py-2 there. */}
        <div className="z-10 w-full overflow-visible md:-my-8">
          <StackedCarousel />
        </div>

        <Reveal className="container z-10 flex w-full flex-col items-center">
          {/* mt-11 clears the carousel's dots, which hang 32px below its own box —
              anything less and they collide with this heading. Type is
              deliberately restrained so the carousel can take the height while
              everything still lands inside one screen. */}
          <h1 className="mt-11 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl xl:text-5xl [@media(max-height:850px)]:lg:text-3xl">
            <span>Building Digital </span>
            <span className="text-primary">Excellence.</span>
          </h1>

          <div className="mb-4 mt-5 flex flex-row gap-2 sm:gap-3">
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

          <div className="grid w-full max-w-5xl grid-cols-2 gap-3 lg:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon
              const colors = colorClasses[service.color]
              return (
                <Link
                  key={service.title}
                  href={service.href}
                  className={`group block h-full rounded-xl border border-border bg-card p-3 text-center transition-all hover:-translate-y-1 sm:p-4 ${colors.hover}`}
                >
                  <div
                    className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${colors.bg}`}
                  >
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${colors.text}`} />
                  </div>
                  <h3 className="text-xs font-bold leading-tight sm:text-base">
                    <span className="block">{service.title}</span>
                    <span className="block font-light opacity-80">{service.titleAccent}</span>
                  </h3>
                </Link>
              )
            })}
          </div>
        </Reveal>

        {/* Background glow */}
        <div className="pointer-events-none absolute right-0 top-0 -z-10 h-full w-full overflow-hidden">
          <div className="absolute right-[-5%] top-[-10%] h-125 w-125 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] h-100 w-100 rounded-full bg-secondary/10 blur-[100px]" />
        </div>
      </section>

      {/* Stats — bento grid: two small cards + a wide one on the left,
          one tall card on the right carrying the project breakdown. */}
      <StatsSection />

      {/* Features */}
      <section className="py-24">
        <div className="container">
          <Reveal className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-5xl">Why Choose Us?</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              We combine creativity with technology to deliver results.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <Reveal
                  key={feature.title}
                  delay={i * 80}
                  className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <section className="bg-linear-to-br from-primary/5 via-transparent to-secondary/5 py-24">
        <div className="container">
          <Reveal className="mb-16 text-center">
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
      <section className="py-24">
        <div className="container">
          <Reveal className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-5xl">Our Branches</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Specialized branches delivering excellence.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {ventures.map((venture, i) => (
              <Reveal key={venture.name} delay={i * 80}>
                <a
                  href={venture.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-2xl border border-border bg-card p-8 text-center transition-all hover:border-primary/30 hover:shadow-xl"
                >
                  <div className="mb-4 flex h-16 items-center justify-center">
                    <Image
                      src={venture.light}
                      alt={venture.name}
                      className="h-12 w-auto transition-transform group-hover:scale-105 dark:hidden"
                      width={120}
                      height={48}
                    />
                    <Image
                      src={venture.dark}
                      alt={venture.name}
                      className="hidden h-12 w-auto transition-transform group-hover:scale-105 dark:block"
                      width={120}
                      height={48}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{venture.description}</p>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-linear-to-r from-primary to-accent py-24">
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
  )
}
