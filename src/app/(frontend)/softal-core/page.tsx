import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { ArrowRight, Code2 } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { Reveal } from '@/components/Reveal'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('softal-core').catch(() => null)
  return generatePageMeta({ slug: 'softal-core', seoDoc, fallbackTitle: 'Softal Core' })
}

const services = [
  { title: 'Custom Development', desc: 'Tailored web and mobile applications built to your specific business needs.' },
  { title: 'SaaS Products', desc: 'Scalable software-as-a-service platforms designed for growth and performance.' },
  { title: 'System Integration', desc: 'Seamlessly connecting your existing tools and databases for unified workflows.' },
]

export default function SoftalCorePage() {
  return (
    <div className="min-h-screen pb-20 pt-32">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-16 space-y-6 text-center">
          <div className="relative mx-auto mb-8 h-24 w-48">
            <Image src="/assets/softal-core.svg" alt="Softal Core" className="object-contain dark:hidden" fill priority />
            <Image src="/assets/dark-softal-core.svg" alt="Softal Core" className="hidden object-contain dark:block" fill priority />
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Software <span className="text-accent">Ingenuity</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Building robust, potential software solutions for modern businesses.
          </p>
        </Reveal>

        <div className="mb-14 grid grid-cols-2 gap-3 text-center sm:mb-20 sm:gap-6 md:grid-cols-3 [&>*:last-child:nth-child(odd)]:col-span-2 md:[&>*:last-child:nth-child(odd)]:col-span-1">
          {services.map((service, i) => (
            <Reveal
              key={service.title}
              delay={i * 80}
              className="h-full rounded-2xl border border-border bg-card p-4 shadow-lg transition-shadow hover:shadow-xl sm:p-6 lg:p-8"
            >
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent sm:mb-6 sm:h-16 sm:w-16">
                <Code2 className="h-5 w-5 sm:h-8 sm:w-8" />
              </div>
              <h3 className="mb-1.5 text-sm font-bold leading-snug sm:mb-3 sm:text-lg lg:text-xl">{service.title}</h3>
              <p className="text-xs text-muted-foreground sm:text-sm lg:text-base">{service.desc}</p>
            </Reveal>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/contact"
            className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-6 py-4 font-bold text-white transition-colors hover:bg-accent/90 sm:px-8"
          >
            Discuss Your Tech Needs <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
