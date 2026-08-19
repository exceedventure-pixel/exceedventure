import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { GoogleAnalytics } from '@/components/Analytics'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'
import { jsonLdScript, organizationSchema, websiteSchema } from '@/utilities/jsonld'
import siteConfig from '@/config/site'

import './globals.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        {/* Goes through next/script, so it executes once the client runtime
            loads rather than during parse — which is why globals.css hides the
            document until it lands. */}
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript([organizationSchema(siteConfig), websiteSchema(siteConfig)]),
          }}
        />
      </head>
      <body>
        <Providers>
          <AdminBar adminBarProps={{ preview: isEnabled }} />
          <div id="page-wrapper">
            <Header />
            {children}
            <Footer />
          </div>
        </Providers>
        {/*
         * Outside #page-wrapper on purpose: the wrapper is transformed for the
         * push-drawer animation, and a transformed ancestor becomes the
         * containing block for `position: fixed` — inside it, the button would
         * ride along with the page instead of staying put in the viewport.
         */}
        <WhatsAppButton />
        <GoogleAnalytics />
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.seo.defaultTitle,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.seo.defaultDescription,
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: siteConfig.seo.twitterHandle || undefined,
  },
  verification: {
    google: siteConfig.seo.googleVerification || undefined,
    other: siteConfig.seo.bingVerification
      ? { 'msvalidate.01': siteConfig.seo.bingVerification }
      : undefined,
  },
}
