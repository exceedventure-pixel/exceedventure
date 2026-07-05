import type { Metadata } from 'next'
import React from 'react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { PageHero } from '@/components/PageHero'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('company/terms-of-service').catch(() => null)
  return generatePageMeta({
    slug: 'company/terms-of-service',
    seoDoc,
    fallbackTitle: 'Terms of Service',
  })
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen">
      <PageHero
        title="Terms of Service"
        subtitle="Please read these terms and conditions carefully before using our services."
        className="min-h-[45vh] pb-8"
      />
      <div className="px-[5%] pb-24">
        <article className="prose prose-lg mx-auto max-w-4xl dark:prose-invert">
          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing and using this website, you accept and agree to be bound by the terms and
            provision of this agreement. If you do not agree to abide by these terms, please do not
            use this service.
          </p>

          <h3>2. Use License</h3>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or
            software) on Exceed Venture&apos;s website for personal, non-commercial transitory viewing
            only. This is the grant of a license, not a transfer of title.
          </p>

          <h3>3. Services</h3>
          <p>
            Exceed Venture provides digital services including web development, automation, AI
            integration, and marketing services. The specific terms for each service will be outlined
            in individual service agreements.
          </p>

          <h3>4. User Responsibilities</h3>
          <p>
            You agree to use our services only for lawful purposes and in a way that does not infringe
            the rights of, restrict or inhibit anyone else&apos;s use and enjoyment of the website.
          </p>

          <h3>5. Intellectual Property</h3>
          <p>
            All content included on this site, such as text, graphics, logos, images, and software, is
            the property of Exceed Venture or its content suppliers and protected by intellectual
            property laws.
          </p>

          <h3>6. Limitation of Liability</h3>
          <p>
            In no event shall Exceed Venture or its suppliers be liable for any damages arising out of
            the use or inability to use the materials on Exceed Venture&apos;s website.
          </p>

          <h3>7. Modifications</h3>
          <p>
            Exceed Venture may revise these terms of service at any time without notice. By using this
            website, you are agreeing to be bound by the then current version of these terms of
            service.
          </p>

          <h3>8. Contact</h3>
          <p>
            If you have any questions about these Terms of Service, please contact us through our
            contact page.
          </p>
        </article>
      </div>
    </div>
  )
}
