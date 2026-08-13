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
  return generatePageMeta({ slug: 'ventures', seoDoc, fallbackTitle: 'Our Branches' })
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
    name: 'Create a Content',
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
            Our <span className="text-primary">Branches</span>
          </>
        }
        subtitle="Explore our specialized branches, each focused on a different aspect of digital transformation and content creation."
        className="min-h-[45vh] pb-8"
      />

      <div className="container pb-20">
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 lg:gap-8 [&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:col-span-1">
          {ventures.map((venture, index) => {
            const colors = colorClasses[venture.color]
            return (
              <Reveal key={venture.name} delay={index * 80} className="h-full">
                <Link
                  href={venture.href}
                  className={`group flex h-full flex-col rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-xl sm:p-6 lg:p-8 ${colors.border}`}
                >
                  <div className={`mb-3 w-fit rounded-xl p-2.5 sm:mb-6 sm:p-4 ${colors.bg}`}>
                    <Image src={venture.light} alt={venture.name} className="h-8 w-auto object-contain sm:h-12 dark:hidden" width={120} height={48} />
                    <Image src={venture.dark} alt={venture.name} className="hidden h-8 w-auto object-contain sm:h-12 dark:block" width={120} height={48} />
                  </div>
                  <h3 className="mb-2 text-base font-bold leading-snug sm:mb-3 sm:text-xl lg:text-2xl">{venture.name}</h3>
                  <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-muted-foreground sm:mb-6 sm:line-clamp-none sm:text-base">{venture.description}</p>
                  <div className="mb-6 hidden flex-wrap gap-2 sm:flex">
                    {venture.features.map((feature) => (
                      <span key={feature} className={`rounded-full px-3 py-1 text-sm ${colors.bg}`}>
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="-mb-2 mt-auto flex min-h-9 items-center gap-1.5 py-2 text-xs font-semibold text-primary transition-all group-hover:gap-3 sm:gap-2 sm:text-base">
                    Visit Branch <ArrowRight className="h-4 w-4 shrink-0" />
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-14 sm:mt-20 rounded-3xl bg-linear-to-r from-primary to-secondary p-6 sm:p-12 text-center text-white">
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
