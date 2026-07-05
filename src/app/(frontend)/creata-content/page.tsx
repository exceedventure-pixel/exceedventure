import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Sparkles } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { Reveal } from '@/components/Reveal'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('creata-content').catch(() => null)
  return generatePageMeta({ slug: 'creata-content', seoDoc, fallbackTitle: 'Create a Content' })
}

const cards = [
  {
    tag: 'Video Production',
    title: 'Video Editing & Motion Graphics',
    desc: 'From social media reels to corporate explainers, we craft videos that capture attention and drive engagement.',
  },
  {
    tag: 'Graphic Design',
    title: 'Visual Design & Illustration',
    desc: 'Eye-catching graphics for social media, marketing campaigns, and digital platforms.',
  },
]

export default function CreataContentPage() {
  return (
    <div className="min-h-screen pb-20 pt-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-16 space-y-6 text-center">
          <div className="relative mx-auto mb-8 h-24 w-48">
            <Image src="/assets/createacontent.svg" alt="Create a Content" className="object-contain dark:hidden" fill priority />
            <Image src="/assets/dark-createacontent.svg" alt="Create a Content" className="hidden object-contain dark:block" fill priority />
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Creative <span className="text-secondary">Content Production</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            We bring stories to life through stunning visuals, compelling copy, and engaging
            multimedia content.
          </p>
        </Reveal>

        <div className="mb-20 grid gap-8 md:grid-cols-2">
          {cards.map((card, i) => (
            <Reveal
              key={card.title}
              delay={i * 80}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
            >
              <div className="relative flex aspect-video items-center justify-center bg-secondary/10 text-lg font-bold text-secondary">
                {card.tag}
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-2xl font-bold">{card.title}</h3>
                <p className="text-muted-foreground">{card.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-secondary px-8 py-4 font-bold text-secondary-foreground transition-colors hover:bg-secondary/90"
          >
            Request Content Services <Sparkles className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
