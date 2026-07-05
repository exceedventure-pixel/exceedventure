import type { Metadata } from 'next'
import React from 'react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { PageHero } from '@/components/PageHero'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('company/privacy-policy').catch(() => null)
  return generatePageMeta({ slug: 'company/privacy-policy', seoDoc, fallbackTitle: 'Privacy Policy' })
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <PageHero
        title="Privacy Policy"
        subtitle="We value your privacy. Read about how we collect, use, and protect your personal information."
        className="min-h-[45vh] pb-8"
      />
      <div className="px-[5%] pb-24">
        <article className="prose prose-lg mx-auto max-w-4xl dark:prose-invert">
          <h3>1. Introduction</h3>
          <p>
            Welcome to Exceed Venture. We respect your privacy and are committed to protecting your
            personal data. This privacy policy will inform you about how we look after your personal
            data when you visit our website and tell you about your privacy rights.
          </p>

          <h3>2. Data We Collect</h3>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you which
            we have grouped together as follows:
          </p>
          <ul>
            <li>
              <strong>Identity Data</strong> includes first name, last name, username or similar
              identifier.
            </li>
            <li>
              <strong>Contact Data</strong> includes email address and telephone numbers.
            </li>
            <li>
              <strong>Technical Data</strong> includes internet protocol (IP) address, browser type
              and version, time zone setting and location.
            </li>
            <li>
              <strong>Usage Data</strong> includes information about how you use our website and
              services.
            </li>
          </ul>

          <h3>3. How We Use Your Data</h3>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use
            your personal data to:
          </p>
          <ul>
            <li>Provide and improve our services to you.</li>
            <li>Communicate with you about our services.</li>
            <li>Send you marketing communications (with your consent).</li>
            <li>Comply with legal obligations.</li>
          </ul>

          <h3>4. Data Security</h3>
          <p>
            We have put in place appropriate security measures to prevent your personal data from
            being accidentally lost, used or accessed in an unauthorized way. We limit access to your
            personal data to those employees and partners who have a business need to know.
          </p>

          <h3>5. Your Rights</h3>
          <p>
            Under certain circumstances, you have rights under data protection laws in relation to
            your personal data, including the right to request access, correction, erasure,
            restriction, transfer, or to object to processing.
          </p>

          <h3>6. Contact Us</h3>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please
            contact us through our contact page.
          </p>
        </article>
      </div>
    </div>
  )
}
