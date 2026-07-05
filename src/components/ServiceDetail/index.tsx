import React from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { Reveal } from '@/components/Reveal'

export type ServiceColor = 'teal' | 'red' | 'blue' | 'purple'

export interface ServiceFeature {
  title: string
  icon: LucideIcon
  desc: string
}

export interface ServiceSection {
  color: ServiceColor
  badge?: string
  title: string
  subtitle: string
  features: ServiceFeature[]
  /** Render a subtle muted background band (used for secondary sections). */
  muted?: boolean
}

interface ServiceDetailProps {
  color: ServiceColor
  icon: LucideIcon
  badge: string
  titleLead: string
  titleAccent: string
  subtitle: string
  sections: ServiceSection[]
}

// Literal class strings so Tailwind's JIT keeps them.
const colorMap: Record<ServiceColor, Record<string, string>> = {
  teal: {
    iconBox: 'bg-teal-500/10 text-teal-500',
    badge: 'text-teal-500 bg-teal-500/10',
    cta: 'bg-teal-500 hover:bg-teal-600 hover:shadow-teal-500/20',
    accent: 'text-teal-500',
    divider: 'via-teal-500',
    card: 'hover:border-teal-500/50 hover:shadow-teal-500/5',
    cardIcon: 'bg-teal-500/10 text-teal-500',
  },
  red: {
    iconBox: 'bg-red-500/10 text-red-500',
    badge: 'text-red-500 bg-red-500/10',
    cta: 'bg-red-500 hover:bg-red-600 hover:shadow-red-500/20',
    accent: 'text-red-500',
    divider: 'via-red-500',
    card: 'hover:border-red-500/50 hover:shadow-red-500/5',
    cardIcon: 'bg-red-500/10 text-red-500',
  },
  blue: {
    iconBox: 'bg-blue-500/10 text-blue-500',
    badge: 'text-blue-500 bg-blue-500/10',
    cta: 'bg-blue-500 hover:bg-blue-600 hover:shadow-blue-500/20',
    accent: 'text-blue-500',
    divider: 'via-blue-500',
    card: 'hover:border-blue-500/50 hover:shadow-blue-500/5',
    cardIcon: 'bg-blue-500/10 text-blue-500',
  },
  purple: {
    iconBox: 'bg-purple-500/10 text-purple-500',
    badge: 'text-purple-500 bg-purple-500/10',
    cta: 'bg-purple-500 hover:bg-purple-600 hover:shadow-purple-500/20',
    accent: 'text-purple-500',
    divider: 'via-purple-500',
    card: 'hover:border-purple-500/50 hover:shadow-purple-500/5',
    cardIcon: 'bg-purple-500/10 text-purple-500',
  },
}

function FeatureGrid({ section }: { section: ServiceSection }) {
  const c = colorMap[section.color]
  return (
    <section
      className={cn('relative pb-24 pt-20', section.muted && 'rounded-t-[3rem] bg-muted/30')}
    >
      <div className={cn('absolute left-0 top-0 h-1 w-full bg-linear-to-r from-transparent to-transparent opacity-50', c.divider)} />
      <div className="container">
        <div className="mb-16 text-center">
          {section.badge && (
            <div className={cn('mb-4 inline-block rounded-full px-4 py-1 text-sm font-bold uppercase tracking-wider', c.badge)}>
              {section.badge}
            </div>
          )}
          <h2 className="mb-6 text-3xl font-bold sm:text-5xl">{section.title}</h2>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">{section.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {section.features.map((feature, i) => {
          const Icon = feature.icon
          return (
            <Reveal
              key={feature.title}
              delay={i * 60}
              className={cn(
                'group rounded-2xl border border-border bg-card p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl',
                c.card,
              )}
            >
              <div className={cn('mb-6 w-fit rounded-xl p-4 transition-transform duration-200 group-hover:scale-110', c.cardIcon)}>
                <Icon size={32} />
              </div>
              <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{feature.desc}</p>
            </Reveal>
          )
        })}
        </div>
      </div>
    </section>
  )
}

export const ServiceDetail: React.FC<ServiceDetailProps> = ({
  color,
  icon: Icon,
  badge,
  titleLead,
  titleAccent,
  subtitle,
  sections,
}) => {
  const c = colorMap[color]
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero */}
      <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden pb-20 pt-24 text-center lg:pt-32">
        <Reveal className="container z-10 flex flex-col items-center">
          <div className={cn('mb-6 rounded-2xl p-4', c.iconBox)}>
            <Icon size={48} />
          </div>
          <div className={cn('mb-4 rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wider', c.badge)}>
            {badge}
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:mb-8 sm:text-7xl lg:text-8xl">
            {titleLead}
            <span className={c.accent}>{titleAccent}</span>
          </h1>
          <p className="mb-8 max-w-3xl text-lg font-light leading-relaxed text-muted-foreground sm:mb-12 sm:text-2xl">
            {subtitle}
          </p>
          <Link
            href="/contact"
            className={cn(
              'mb-8 whitespace-nowrap rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-colors duration-200 sm:px-8 sm:py-4 sm:text-lg',
              c.cta,
            )}
          >
            Start a Project
          </Link>
        </Reveal>
      </div>

      {sections.map((section, i) => (
        <FeatureGrid key={i} section={section} />
      ))}
    </div>
  )
}
