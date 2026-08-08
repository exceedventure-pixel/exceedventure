import type { Metadata } from 'next'
import React from 'react'
import { Sparkles, Target, Video } from 'lucide-react'

import { getPageSEO } from '@/utilities/getPageSEO'
import { generatePageMeta } from '@/utilities/generateMeta'
import { ServiceDetail } from '@/components/ServiceDetail'

export const dynamic = 'force-static'
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const seoDoc = await getPageSEO("creative-branding/content-supply/video-editing").catch(() => null)
  return generatePageMeta({
    slug: "creative-branding/content-supply/video-editing",
    seoDoc,
    fallbackTitle: "Video Editing",
  })
}

export default function Page() {
  return (
    <ServiceDetail
        color="purple"
        icon={Video}
        badge="Specialist Service"
        titleLead="Video "
        titleAccent="Editing"
        subtitle="Edited video for social, advertising and your website."
        sections={[
          {
            color: "purple",
            title: 'What this service covers',
            subtitle: "Edited video for social, advertising and your website.",
            features: [
              {
                title: "Social Cutdowns",
                icon: Video,
                desc: "One shoot cut into everything each platform wants.",
              },
              {
                title: "Subtitles & Graphics",
                icon: Sparkles,
                desc: "Built to work on mute, which is how most people watch.",
              },
              {
                title: "Ad-Ready Versions",
                icon: Target,
                desc: "Versions cut to the specs each ad platform requires.",
              },
            ],
          },
        ]}
      />
  )
}
