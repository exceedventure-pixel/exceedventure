import type { Metadata } from 'next'
import React from 'react'
import {
  FileText,
  Images,
  Sparkles,
  Megaphone,
  Camera,
  Video,
  Mic,
  Clapperboard,
  Scissors,
  Film,
  PenTool,
  Calendar,
  Repeat,
} from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'
import { SubServiceGrid } from '@/components/SubServiceGrid'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO('creative-branding/content-supply').catch(() => null)
  return generatePageMeta({
    slug: 'creative-branding/content-supply',
    seoDoc,
    fallbackTitle: 'Content Supply',
    fallbackDescription:
      'Marketing works when it is consistent. Content is always the thing that gets pushed when the week gets busy — and three months later the channel is dead.',
  })
}

export default function Page() {
  return (
    <>
      <ServiceDetail
        slug="creative-branding/content-supply"
        color="purple"
        icon={FileText}
        badge="Production Service"
        titleLead="Content "
        titleAccent="Supply"
        subtitle="A reliable pipeline of on-brand content, produced at the volume and cadence your channels demand."
        hero={{
          badge: 'Content Supply',
          headline: 'The content calendar is the ',
          headlineAccent: 'first thing to slip.',
          pain: 'Content gets pushed when the week gets busy, and the channel quietly dies.',
          symptoms: [
            'Your last post was a while ago',
            'Content only happens in spare time',
            'You start strong and fade',
          ],
          primaryCta: { label: 'Get a free content plan', href: '/contact' },
          secondaryCta: { label: 'See our work', href: '/our-works' },
        }}
        sections={[
          {
            color: 'purple',
            title: 'What this service is for',
            subtitle:
              'Consistent, high-quality content across formats — planned, produced, and ready to publish.',
            features: [
              {
                title: 'Statics',
                icon: Images,
                desc: 'Scroll-stopping static posts and graphics for every feed.',
              },
              {
                title: 'Motions',
                icon: Sparkles,
                desc: 'Animated graphics and motion design that add polish and energy.',
              },
              {
                title: 'Ad Creatives',
                icon: Megaphone,
                desc: 'High-converting creatives designed for paid campaigns.',
              },
              {
                title: 'Photography',
                icon: Camera,
                desc: 'Product, brand, and lifestyle photography that sells.',
              },
              {
                title: 'Videography',
                icon: Video,
                desc: 'On-location and studio video shot to your brief.',
              },
              {
                title: 'Talking Heads',
                icon: Mic,
                desc: 'Presenter-style videos that build trust and authority.',
              },
              {
                title: 'Reels',
                icon: Clapperboard,
                desc: 'Vertical short-form reels built to hook and retain.',
              },
              {
                title: 'Clipping',
                icon: Scissors,
                desc: 'Long videos cut into sharp, shareable short-form clips.',
              },
              {
                title: 'Editing',
                icon: Film,
                desc: 'Professional editing with pacing, captions, and sound design.',
              },
              {
                title: 'Blog & Articles',
                icon: FileText,
                desc: 'Researched, SEO-aware long-form content that builds authority.',
              },
              {
                title: 'Copywriting',
                icon: PenTool,
                desc: 'Persuasive copy for ads, pages, emails, and captions.',
              },
              {
                title: 'Content Calendar',
                icon: Calendar,
                desc: 'A planned publishing schedule so your channels never go quiet.',
              },
              {
                title: 'Content Repurposing',
                icon: Repeat,
                desc: 'Turn one asset into many across formats and platforms.',
              },
            ],
          },
        ]}
      />
      <SubServiceGrid parentHref="/creative-branding/content-supply" />
    </>
  )
}
