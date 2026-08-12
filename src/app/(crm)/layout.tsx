import React from 'react'
import { GeistSans } from 'geist/font/sans'
import { cn } from '@/utilities/ui'
import '../(frontend)/globals.css'
import './crm-theme.css'

/**
 * Root layout for the CRM and client dashboard.
 *
 * A separate route group from (frontend), so neither area inherits the marketing
 * site's header, footer or 80% container width — but it reuses the same
 * stylesheet, so the design tokens and Tailwind utilities are identical.
 *
 * `data-theme` is set explicitly and NOT left to the theme script: globals.css
 * hides `html` until a theme resolves (a FOUC guard for the marketing site), so
 * without this the whole CRM would render invisible.
 */
export const metadata = {
  title: 'Exceed Venture',
  // Private areas — keep them out of search results entirely.
  robots: { index: false, follow: false },
}

/**
 * Never prerender anything in here. Applies to every route below this layout.
 *
 * Semantically this is just true: every CRM and portal page is scoped to the
 * signed-in account, so a build-time snapshot of one would be meaningless at
 * best and someone else's data at worst.
 *
 * It is also what makes the Docker image buildable. `crmQuery()` opens the
 * Postgres connection *before* it reads the session cookie, so during
 * prerendering the database call throws before the cookie read that would have
 * marked the page dynamic. With a live database on the machine that mistake is
 * invisible — the page renders, goes dynamic, and the build passes. In a build
 * container with no database it is fatal.
 */
export const dynamic = 'force-dynamic'

export default function CrmRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={cn(GeistSans.variable)}>
      {/* The tinted ground lives on the area wrapper, not here — see crm-theme.css. */}
      <body className="text-foreground antialiased">{children}</body>
    </html>
  )
}
