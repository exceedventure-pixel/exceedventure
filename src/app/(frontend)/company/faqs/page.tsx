import type { Metadata } from 'next'
import React from 'react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { jsonLdScript } from '@/utilities/jsonld'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('company/faqs').catch(() => null)
  return generatePageMeta({ slug: 'company/faqs', seoDoc, fallbackTitle: 'FAQs' })
}

const faqs = [
  {
    question: 'What services do you offer?',
    answer:
      'We offer a wide range of services including Web Development, Automation & AI Integration, Media Buying & SEO Services, and Creative Assets & Branding.',
  },
  {
    question: 'How can I get started?',
    answer:
      "Simply contact us through our contact page or book a consultation call. We'll discuss your needs and create a tailored solution for your business.",
  },
  {
    question: 'What is your pricing model?',
    answer:
      'Our pricing varies based on the scope and complexity of each project. We offer custom quotes after understanding your specific requirements. Contact us for a free consultation.',
  },
  {
    question: 'How long does a typical project take?',
    answer:
      'Project timelines depend on the scope and requirements. A simple website might take 2-4 weeks, while complex web systems or AI integrations can take 2-3 months. We provide detailed timelines during our initial consultation.',
  },
  {
    question: 'Do you offer ongoing support?',
    answer:
      'Yes! We offer various support and maintenance packages to ensure your digital solutions continue to perform optimally after launch.',
  },
]

export default function FAQsPage() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((f) => ({
                '@type': 'Question',
                name: f.question,
                acceptedAnswer: { '@type': 'Answer', text: f.answer },
              })),
            },
          ]),
        }}
      />

      <PageHero
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about our services, pricing, and processes."
      />

      <div className="px-[5%] pb-24">
        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((faq, i) => (
            <Reveal key={faq.question} delay={i * 60}>
              <details className="group rounded-2xl border border-border bg-card/60 p-1 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-lg font-medium">
                  {faq.question}
                  <svg
                    className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <p className="px-5 pb-5 pt-0 text-muted-foreground">{faq.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  )
}
