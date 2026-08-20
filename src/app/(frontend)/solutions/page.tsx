import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'
import {
  Globe,
  Bot,
  Megaphone,
  Palette,
  TrendingUp,
  Target,
  FileText,
  Users,
  ArrowRight,
  type LucideIcon,
  Layers,
} from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { jsonLdScript, webPageSchema, breadcrumbSchema } from '@/utilities/jsonld'
import siteConfig from '@/config/site'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('solutions').catch(() => null)
  return generatePageMeta({ slug: 'solutions', seoDoc, fallbackTitle: 'Solutions' })
}

const solutions: {
  title: string
  description: string
  icon: LucideIcon
  color: string
  href: string
  features: string[]
}[] = [
  {
    title: 'Websites & Apps',
    description:
      'Build high-performance digital foundations with professional websites, landing pages, and web applications.',
    icon: Globe,
    color: 'teal',
    href: '/solutions/websites-apps',
    features: ['Business Websites', 'Landing Pages', 'Web Dashboards', 'Client Portals'],
  },
  {
    title: 'Automation',
    description:
      'Make businesses run smarter with AI integration and intelligent automation solutions.',
    icon: Bot,
    color: 'red',
    href: '/solutions/automation',
    features: [
      'AI Integration',
      'Task Automation',
      'Business Process Automation',
      'Custom Workflows',
    ],
  },
  {
    title: 'Media Buying',
    description:
      'Reach the right audience with paid campaigns across search and social, optimized for ROI.',
    icon: Megaphone,
    color: 'blue',
    href: '/solutions/media-buying',
    features: ['Paid Advertising', 'Media Planning', 'Audience Targeting', 'Retargeting'],
  },
  {
    title: 'Web Growth (SEO)',
    description:
      'Earn compounding organic traffic with data-driven SEO that lifts your rankings and keeps them there.',
    icon: TrendingUp,
    color: 'emerald',
    href: '/solutions/web-growth-seo',
    features: ['SEO Strategy', 'Technical SEO', 'Link Building', 'Keyword Research'],
  },
  {
    title: 'Branding',
    description: 'Elevate your brand with distinctive design and creative assets that resonate.',
    icon: Palette,
    color: 'purple',
    href: '/solutions/branding',
    features: ['Brand Identity', 'Graphic Design', 'UI/UX Design', 'Motion Graphics'],
  },
  {
    title: 'Marketing',
    description:
      'A full-funnel marketing engine that turns strangers into customers and customers into advocates.',
    icon: Target,
    color: 'amber',
    href: '/solutions/marketing',
    features: [
      'Marketing Strategy',
      'Campaign Management',
      'Email Marketing',
      'Funnel Optimization',
    ],
  },
  {
    title: 'Content Supply',
    description:
      'A reliable pipeline of on-brand content, produced at the volume and cadence your channels demand.',
    icon: FileText,
    color: 'pink',
    href: '/solutions/content-supply',
    features: ['Blog & Articles', 'Video Content', 'Graphic Design', 'Copywriting'],
  },
  {
    title: 'SMM & VA',
    description:
      'Keep your social presence active and your back office moving with dedicated management and support.',
    icon: Users,
    color: 'indigo',
    href: '/solutions/smm-va',
    features: [
      'Social Media Management',
      'Community Engagement',
      'Virtual Assistants',
      'Reporting',
    ],
  },
]

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'hover:border-teal-500/50' },
  red: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'hover:border-red-500/50' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'hover:border-blue-500/50' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'hover:border-purple-500/50' },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    border: 'hover:border-emerald-500/50',
  },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'hover:border-amber-500/50' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'hover:border-pink-500/50' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'hover:border-indigo-500/50' },
}

export default async function SolutionsPage() {
  const seoDoc = await getPageSEO('solutions').catch(() => null)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageSchema({
              name: seoDoc?.meta?.title ?? 'Solutions',
              description:
                seoDoc?.meta?.description ??
                `Explore the full range of solutions offered by ${siteConfig.name}.`,
              url: `${siteConfig.url}/solutions`,
              type: 'WebPage',
            }),
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: 'Solutions', href: '/solutions' },
            ]),
          ]),
        }}
      />

      <PageHero
        badge="Solutions"
        icon={Layers}
        title="Our "
        titleAccent="Solutions"
        outlineWord="Solutions"
        primaryCta={{ label: 'Talk to us', href: '/contact' }}
        secondaryCta={{ label: 'See pricing', href: '/pricing' }}
        subtitle="We provide comprehensive digital solutions to help businesses thrive in the modern landscape."
      />

      {/* Solutions grid */}
      <section className="pb-16 sm:pb-24">
        <div className="container grid grid-cols-2 gap-3 sm:gap-6 lg:gap-8 [&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:col-span-1">
          {solutions.map((solution, index) => {
            const Icon = solution.icon
            const colors = colorClasses[solution.color]
            return (
              <Reveal
                key={solution.href}
                delay={index * 80}
                className={`group flex h-full flex-col rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-xl sm:p-6 lg:p-8 ${colors.border}`}
              >
                <div
                  className={`mb-3 w-fit rounded-xl p-2.5 sm:mb-6 sm:p-4 ${colors.bg} ${colors.text} transition-transform duration-200 group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6 sm:h-9 sm:w-9 lg:h-10 lg:w-10" />
                </div>
                <h3 className="mb-2 text-base font-bold leading-snug sm:mb-3 sm:text-xl lg:text-2xl">
                  {solution.title}
                </h3>
                <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-muted-foreground sm:mb-6 sm:line-clamp-none sm:text-base">
                  {solution.description}
                </p>
                <div className="mb-6 hidden flex-wrap gap-2 sm:flex">
                  {solution.features.map((feature) => (
                    <span
                      key={feature}
                      className={`rounded-full px-3 py-1 text-sm ${colors.bg} ${colors.text}`}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <Link
                  href={solution.href}
                  className={`-mb-2 mt-auto inline-flex min-h-9 items-center gap-1.5 py-2 text-xs font-semibold sm:gap-2 sm:text-base ${colors.text} transition-all hover:gap-3`}
                >
                  Learn More <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16 sm:pb-24">
        <div className="container">
          <div className="rounded-3xl bg-linear-to-r from-primary to-secondary p-6 sm:p-12 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Get Started?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
              Let&apos;s discuss how we can help transform your business with our comprehensive
              digital solutions.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-bold text-primary transition-colors hover:bg-white/90"
            >
              Contact Us <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
