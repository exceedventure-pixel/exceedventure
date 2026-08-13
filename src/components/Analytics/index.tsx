import Script from 'next/script'
import React from 'react'

import siteConfig from '@/config/site'

/**
 * Google Analytics 4, on the public site only.
 *
 * Mounted from the `(frontend)` layout and nowhere else. `/admin` is the CMS and
 * `/crm` and `/portal` are private team and client areas — measuring those would
 * mix staff and signed-in client sessions into the marketing numbers, and send a
 * logged-in client's page views to Google, which is a different privacy promise
 * from the one the public site makes.
 *
 * Nothing renders unless a measurement id is configured *and* this is a
 * production build, so local development and CI never send hits. Set
 * `NEXT_PUBLIC_GA_MEASUREMENT_ID` to an empty string on a staging deployment to
 * keep that environment out of the reporting too.
 *
 * `afterInteractive` rather than the raw `async` tag: the snippet Google gives
 * you blocks nothing, but loading it after hydration keeps it off the critical
 * path entirely.
 */
export const GoogleAnalytics: React.FC = () => {
  const measurementId = siteConfig.seo.googleAnalyticsId

  if (!measurementId || process.env.NODE_ENV !== 'production') return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  )
}

export default GoogleAnalytics
