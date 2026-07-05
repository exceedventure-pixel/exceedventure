import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { ArrowRight } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('ventures').catch(() => null)
  return generatePageMeta({ slug: 'ventures', seoDoc, fallbackTitle: 'Our Ventures' })
}

const ventures = [
  {
    name: 'Corporate Crafts',
    description:
      'Professional corporate documents, pitch decks, and business materials designed to impress.',
    light: '/assets/corporate-crafts.svg',
    dark: '/assets/dark-corporate-crafts.svg',
    color: 'yellow',
    href: '/corporate-crafts',
    features: ['Company Brochures', 'Pitch Decks', 'Business Documents', 'Corporate Presentations'],
  },
  {
    name: 'Creata Content',
    description: 'Visual content and motion creatives that support campaigns, products, and brands.',
    light: '/assets/createacontent.svg',
    dark: '/assets/dark-createacontent.svg',
    color: 'red',
    href: '/creata-content',
    features: ['Static Content', 'Motion Graphics', 'Short Videos', 'Campaign Assets'],
  },
  {
    name: 'Softal Core',
    description:
      'Software, AI tools, and automation products designed to solve real business problems.',
    light: '/assets/softal-core.svg',
    dark: '/assets/dark-softal-core.svg',
    color: 'blue',
    href: '/softal-core',
    features: ['SaaS Platforms', 'AI Products', 'AI Chatbots', 'Automation Tools'],
  },
]

const colorClasses: Record<string, { bg: string; border: string }> = {
  yellow: { bg: 'bg-yellow-500/10', border: 'hover:border-yellow-500/50' },
  red: { bg: 'bg-red-500/10', border: 'hover:border-red-500/50' },
  blue: { bg: 'bg-blue-700/10', border: 'hover:border-blue-700/50' },
}

export default function VenturesPage() {
  return (
    <div className="min-h-screen">
      <PageHero
        title={
          <>
            Our <span className="text-primary">Ventures</span>
          </>
        }
        subtitle="Explore our creative ventures, each specializing in different aspects of digital transformation and content creation."
        className="min-h-[45vh] pb-8"
      />

      <div className="px-[5%] pb-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
          {ventures.map((venture, index) => {
            const colors = colorClasses[venture.color]
            return (
              <Reveal key={venture.name} delay={index * 80}>
                <Link
                  href={venture.href}
                  className={`group flex h-full flex-col rounded-2xl border border-border bg-card p-8 transition-all duration-200 hover:shadow-xl ${colors.border}`}
                >
                  <div className={`mb-6 w-fit rounded-xl p-4 ${colors.bg}`}>
                    <Image src={venture.light} alt={venture.name} className="h-12 w-auto object-contain dark:hidden" width={120} height={48} />
                    <Image src={venture.dark} alt={venture.name} className="hidden h-12 w-auto object-contain dark:block" width={120} height={48} />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold">{venture.name}</h3>
                  <p className="mb-6 leading-relaxed text-muted-foreground">{venture.description}</p>
                  <div className="mb-6 flex flex-wrap gap-2">
                    {venture.features.map((feature) => (
                      <span key={feature} className={`rounded-full px-3 py-1 text-sm ${colors.bg}`}>
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center gap-2 font-semibold text-primary transition-all group-hover:gap-3">
                    Visit Venture <ArrowRight size={18} />
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mx-auto mt-20 max-w-6xl rounded-3xl bg-linear-to-r from-primary to-secondary p-12 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Want to Work With Us?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
            Whether you need corporate documents, creative content, or software solutions, we&apos;ve
            got you covered.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 font-bold text-primary transition-colors hover:bg-white/90"
          >
            Get in Touch <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}
