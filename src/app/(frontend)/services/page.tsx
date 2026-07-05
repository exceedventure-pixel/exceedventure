import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'
import { Globe, Bot, Megaphone, Palette, ArrowRight, type LucideIcon } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { jsonLdScript, webPageSchema, breadcrumbSchema } from '@/utilities/jsonld'
import siteConfig from '@/config/site'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('services').catch(() => null)
  return generatePageMeta({ slug: 'services', seoDoc, fallbackTitle: 'Services' })
}

const services: {
  title: string
  description: string
  icon: LucideIcon
  color: string
  href: string
  features: string[]
}[] = [
  {
    title: 'Websites & Web Systems',
    description:
      'Build high-performance digital foundations with professional websites, landing pages, and web applications.',
    icon: Globe,
    color: 'teal',
    href: '/services/websites-web-systems',
    features: ['Business Websites', 'Landing Pages', 'Web Dashboards', 'Client Portals'],
  },
  {
    title: 'Automation & AI Integration',
    description:
      'Make businesses run smarter with AI integration and intelligent automation solutions.',
    icon: Bot,
    color: 'red',
    href: '/services/automation-ai',
    features: ['AI Integration', 'Task Automation', 'Business Process Automation', 'Custom Workflows'],
  },
  {
    title: 'Media Buying & SEO',
    description:
      'Boost your visibility with strategic media buying and data-driven SEO optimization.',
    icon: Megaphone,
    color: 'blue',
    href: '/services/media-buying-seo',
    features: ['SEO Strategy', 'Paid Advertising', 'Link Building', 'Performance Analytics'],
  },
  {
    title: 'Creative Assets & Branding',
    description: 'Elevate your brand with distinctive design and creative assets that resonate.',
    icon: Palette,
    color: 'purple',
    href: '/services/creative-assets-branding',
    features: ['Brand Identity', 'Graphic Design', 'UI/UX Design', 'Motion Graphics'],
  },
]

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'hover:border-teal-500/50' },
  red: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'hover:border-red-500/50' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'hover:border-blue-500/50' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'hover:border-purple-500/50' },
}

export default async function ServicesPage() {
  const seoDoc = await getPageSEO('services').catch(() => null)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageSchema({
              name: seoDoc?.meta?.title ?? 'Services',
              description:
                seoDoc?.meta?.description ??
                `Explore the full range of services offered by ${siteConfig.name}.`,
              url: `${siteConfig.url}/services`,
              type: 'WebPage',
            }),
            breadcrumbSchema([
              { name: 'Home', href: '/' },
              { name: 'Services', href: '/services' },
            ]),
          ]),
        }}
      />

      <PageHero
        title={
          <>
            Our <span className="text-primary">Services</span>
          </>
        }
        subtitle="We provide comprehensive digital solutions to help businesses thrive in the modern landscape."
      />

      {/* Services grid */}
      <section className="pb-24">
        <div className="container grid grid-cols-1 gap-8 lg:grid-cols-2">
          {services.map((service, index) => {
            const Icon = service.icon
            const colors = colorClasses[service.color]
            return (
              <Reveal
                key={service.href}
                delay={index * 80}
                className={`group rounded-2xl border border-border bg-card p-8 transition-all duration-200 hover:shadow-xl ${colors.border}`}
              >
                <div className={`mb-6 w-fit rounded-xl p-4 ${colors.bg} ${colors.text} transition-transform duration-200 group-hover:scale-110`}>
                  <Icon size={40} />
                </div>
                <h3 className="mb-3 text-2xl font-bold">{service.title}</h3>
                <p className="mb-6 leading-relaxed text-muted-foreground">{service.description}</p>
                <div className="mb-6 flex flex-wrap gap-2">
                  {service.features.map((feature) => (
                    <span key={feature} className={`rounded-full px-3 py-1 text-sm ${colors.bg} ${colors.text}`}>
                      {feature}
                    </span>
                  ))}
                </div>
                <Link
                  href={service.href}
                  className={`inline-flex items-center gap-2 font-semibold ${colors.text} transition-all hover:gap-3`}
                >
                  Learn More <ArrowRight size={18} />
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="container">
          <div className="rounded-3xl bg-linear-to-r from-primary to-secondary p-12 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Get Started?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
            Let&apos;s discuss how we can help transform your business with our comprehensive digital
            solutions.
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
