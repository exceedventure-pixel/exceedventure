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
  Rocket,
  Shield,
  Users,
  TrendingUp,
  BarChart3,
  Brain,
  Workflow,
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

// ─── Static content ───────────────────────────────────────────────────────────
const services: { title: string; subtitle: string; icon: LucideIcon; color: string; href: string }[] = [
  { title: 'WEBSITES', subtitle: '& WEB SYSTEMS', icon: Globe, color: 'teal', href: '/services/websites-web-systems' },
  { title: 'AUTOMATION', subtitle: '& AI INTEGRATION', icon: Bot, color: 'red', href: '/services/automation-ai' },
  { title: 'MEDIA BUYING', subtitle: '& SEO', icon: Megaphone, color: 'blue', href: '/services/media-buying-seo' },
  { title: 'CREATIVE ASSETS', subtitle: '& BRANDING', icon: Palette, color: 'purple', href: '/services/creative-assets-branding' },
]

const colorClasses: Record<string, { bg: string; hover: string; text: string }> = {
  teal: { bg: 'bg-teal-500/10', hover: 'hover:border-teal-500/40', text: 'text-teal-500' },
  red: { bg: 'bg-red-500/10', hover: 'hover:border-red-500/40', text: 'text-red-500' },
  blue: { bg: 'bg-blue-500/10', hover: 'hover:border-blue-500/40', text: 'text-blue-500' },
  purple: { bg: 'bg-purple-500/10', hover: 'hover:border-purple-500/40', text: 'text-purple-500' },
}

const stats = [
  { value: 50, suffix: '+', label: 'Projects Delivered' },
  { value: 98, suffix: '%', label: 'Client Satisfaction' },
  { value: 24, suffix: '/7', label: 'Support Available' },
  { value: 10, suffix: '+', label: 'Years Combined Experience' },
]

const features: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Rocket, title: 'Fast Delivery', description: 'We deliver projects on time, every time.' },
  { icon: Shield, title: 'Secure & Reliable', description: 'Enterprise-grade security for your peace of mind.' },
  { icon: Users, title: 'Dedicated Support', description: 'A team that cares about your success.' },
  { icon: TrendingUp, title: 'Growth Focused', description: 'Solutions designed to help you scale.' },
]

const ventures = [
  { name: 'Softal Core', light: '/assets/softal-core.svg', dark: '/assets/dark-softal-core.svg', href: 'https://softalcore.exceedventure.com', description: 'Software Solutions' },
  { name: 'Corporate Crafts', light: '/assets/corporate-crafts.svg', dark: '/assets/dark-corporate-crafts.svg', href: 'https://corporatecrafts.exceedventure.com', description: 'Corporate Branding' },
  { name: 'Create a Content', light: '/assets/createacontent.svg', dark: '/assets/dark-createacontent.svg', href: 'https://createacontent.exceedventure.com', description: 'Content Marketing' },
]

const dashboardItems: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Monitor metrics in real-time' },
  { icon: Brain, title: 'AI Insights', desc: 'Smart recommendations' },
  { icon: Workflow, title: 'Automation', desc: 'Automate repetitive tasks' },
]

export default function HomeClient() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center pb-20 pt-32 text-center lg:pb-32 lg:pt-48">
        <Reveal className="container z-10 flex w-full flex-col items-center">
          <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span>Building Digital </span>
            <span className="text-primary">Excellence.</span>
          </h1>
          <p className="mb-12 max-w-3xl text-lg text-muted-foreground sm:text-xl">
            Imagine a business where your branding does the talking, your AI handles the paperwork,
            and your content attracts your dream clients.
          </p>
          <div className="mb-16 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-lg font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
            >
              Start a Project <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/our-works"
              className="inline-flex items-center justify-center rounded-xl border border-border px-8 py-3 text-lg font-medium transition-colors hover:bg-muted"
            >
              View Our Work
            </Link>
          </div>

          <div className="grid w-full max-w-6xl grid-cols-2 gap-4 lg:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon
              const colors = colorClasses[service.color]
              return (
                <Link
                  key={service.title}
                  href={service.href}
                  className={`group block h-full rounded-2xl border border-border bg-card p-3 text-center transition-all hover:-translate-y-1 sm:p-6 ${colors.hover}`}
                >
                  <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl sm:mb-4 sm:h-12 sm:w-12 ${colors.bg}`}>
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${colors.text}`} />
                  </div>
                  <h3 className="text-sm font-bold sm:text-lg">
                    {service.title}
                    <br />
                    <span className="text-[10px] font-light opacity-70 sm:text-sm">{service.subtitle}</span>
                  </h3>
                </Link>
              )
            })}
          </div>
        </Reveal>

        {/* Background glow */}
        <div className="pointer-events-none absolute right-0 top-0 -z-10 h-full w-full overflow-hidden">
          <div className="absolute right-[-5%] top-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] h-[400px] w-[400px] rounded-full bg-secondary/10 blur-[100px]" />
        </div>
      </section>

      {/* Stacked carousel */}
      <section className="overflow-visible py-8 md:py-16">
        <StackedCarousel />
      </section>

      {/* Stats */}
      <section className="bg-muted/50 py-20">
        <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <Reveal key={stat.label} className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary sm:text-5xl">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

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
                <Image src="/assets/home-page-01.svg" alt="Dashboard" className="h-auto w-full" width={600} height={400} />
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
                    <Image src={venture.light} alt={venture.name} className="h-12 w-auto transition-transform group-hover:scale-105 dark:hidden" width={120} height={48} />
                    <Image src={venture.dark} alt={venture.name} className="hidden h-12 w-auto transition-transform group-hover:scale-105 dark:block" width={120} height={48} />
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
            <h2 className="mb-6 text-3xl font-bold text-white sm:text-5xl">Ready to Exceed Your Goals?</h2>
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
