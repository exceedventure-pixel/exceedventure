import type { Metadata } from 'next'
import React from 'react'
import {
  Globe,
  User,
  Briefcase,
  ShoppingCart,
  Building2,
  LayoutTemplate,
  ShoppingBag,
  Triangle,
  Server,
  Cloud,
  HardDrive,
  Database,
  Leaf,
  Boxes,
  Hexagon,
  Layers,
  Store,
  Shield,
  Zap,
  Table2,
  Workflow,
} from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('solutions/websites-apps').catch(() => null)
  return generatePageMeta({
    slug: 'solutions/websites-apps',
    seoDoc,
    fallbackTitle: 'Websites & Apps',
    fallbackDescription:
      'It never sleeps, never forgets the pitch, and costs the same whether it handles ten visitors or ten thousand — provided it was built to sell rather than to describe.',
  })
}

export default function Page() {
  return (
    <ServiceDetail
      slug="solutions/websites-apps"
      color="teal"
      icon={Globe}
      badge="Core Service"
      titleLead="Websites & "
      titleAccent="Apps"
      subtitle="Build high-performance digital foundations."
      hero={{
        badge: 'Websites & Apps',
        headline: 'Your cheapest ',
        headlineAccent: 'salesperson.',
        pain: 'It never sleeps and never forgets the pitch — if it was built to sell.',
        symptoms: [
          'Your site describes, never asks',
          'Contact is hard to find',
          'Unchanged since launch',
        ],
        primaryCta: { label: 'Get a free website review', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '/our-works' },
      }}
      sections={[
        {
          color: 'teal',
          cols: 4,
          title: 'What this service is for',
          subtitle:
            'Websites and apps tailored to every stage — from personal portfolios to enterprise-grade platforms.',
          features: [
            {
              title: 'Personal',
              icon: User,
              desc: 'Polished sites for individuals and professionals.',
              items: [
                'Personal portfolios',
                'Professional appointment booking',
                'Personal brand & landing pages',
              ],
            },
            {
              title: 'Business',
              icon: Briefcase,
              desc: 'Marketing sites that turn visitors into customers.',
              items: ['Business websites', 'Landing pages', 'Booking & lead-gen forms'],
            },
            {
              title: 'E-commerce',
              icon: ShoppingCart,
              desc: 'Online stores built to sell.',
              items: ['Online stores', 'Product catalogs', 'Secure checkout & payments'],
            },
            {
              title: 'Enterprise',
              icon: Building2,
              desc: 'Scalable platforms for complex operations.',
              items: ['Web dashboards', 'Client portals', 'CRM-connected systems'],
            },
          ],
        },
        {
          color: 'teal',
          muted: true,
          badge: 'Our stack',
          title: 'Platforms & technology we use',
          subtitle:
            'We pick the right tools for the job — from no-code platforms to fully custom builds — so your site stays fast, scalable, and easy to maintain.',
          groups: [
            {
              label: 'CMS / frameworks',
              features: [
                {
                  title: 'WordPress',
                  icon: LayoutTemplate,
                  desc: 'Flexible CMS for content-rich sites and blogs.',
                },
                {
                  title: 'Shopify',
                  icon: ShoppingBag,
                  desc: 'Hosted e-commerce for fast, reliable online stores.',
                },
                {
                  title: 'Next.js',
                  icon: Triangle,
                  desc: 'React framework for fast, SEO-friendly web apps.',
                },
              ],
            },
            {
              label: 'Runtime / backends',
              features: [
                {
                  title: 'Node.js',
                  icon: Hexagon,
                  desc: 'JavaScript runtime powering our APIs and backends.',
                },
                {
                  title: 'Payload',
                  icon: Layers,
                  desc: 'Modern headless CMS for custom content models.',
                },
                {
                  title: 'Medusa',
                  icon: Store,
                  desc: 'Headless commerce engine for bespoke storefronts.',
                },
              ],
            },
            {
              label: 'Databases / storage',
              features: [
                {
                  title: 'PostgreSQL',
                  icon: Database,
                  desc: 'Robust relational database for structured data.',
                },
                {
                  title: 'MongoDB',
                  icon: Leaf,
                  desc: 'Flexible NoSQL database for fast-moving data.',
                },
                {
                  title: 'SQLite',
                  icon: Table2,
                  desc: 'Lightweight, file-based SQL for small, fast apps.',
                },
                {
                  title: 'Redis',
                  icon: Zap,
                  desc: 'In-memory store for caching and real-time speed.',
                },
                {
                  title: 'S3 Storage',
                  icon: Boxes,
                  desc: 'Scalable object storage for media and files.',
                },
              ],
            },
            {
              label: 'Hosting / infra',
              features: [
                {
                  title: 'Contabo',
                  icon: Server,
                  desc: 'Cost-effective cloud servers for scalable hosting.',
                },
                {
                  title: 'Hostinger',
                  icon: Cloud,
                  desc: 'Managed web hosting for quick, reliable launches.',
                },
                {
                  title: 'VPS',
                  icon: HardDrive,
                  desc: 'Dedicated virtual servers for full control and performance.',
                },
                {
                  title: 'Cloudflare',
                  icon: Shield,
                  desc: 'CDN, DNS, and security that keep sites fast and safe.',
                },
                {
                  title: 'CI/CD Pipeline',
                  icon: Workflow,
                  desc: 'Automated build, test, and deploy on every push.',
                },
              ],
            },
          ],
        },
      ]}
    />
  )
}
