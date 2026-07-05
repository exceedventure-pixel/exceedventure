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

        <div className="mb-20 grid gap-6 text-center md:grid-cols-3">
          {services.map((service, i) => (
            <Reveal
              key={service.title}
              delay={i * 80}
              className="rounded-2xl border border-border bg-card p-8 shadow-lg transition-shadow hover:shadow-xl"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Code2 className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-bold">{service.title}</h3>
              <p className="text-muted-foreground">{service.desc}</p>
            </Reveal>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 font-bold text-white transition-colors hover:bg-accent/90"
          >
            Discuss Your Tech Needs <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
