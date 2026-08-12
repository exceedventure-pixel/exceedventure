'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, PauseCircle } from 'lucide-react'
import siteConfig from '@/config/site'

/**
 * Shown to a teammate whose account has been paused.
 *
 * The pause is enforced in access control, so a paused session already reads
 * nothing. Without this screen it would render the CRM with every list empty,
 * which looks like an outage rather than a decision.
 */
export const StaffPaused: React.FC = () => {
  const router = useRouter()

  const signOut = async () => {
    await fetch('/crm/api/logout', { method: 'POST' }).catch(() => undefined)
    router.push('/crm/login')
    router.refresh()
  }

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 text-center">
        <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
          <PauseCircle className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="text-lg font-semibold">Your access is paused</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          An admin has suspended this account. Nothing has been deleted — speak to them and it can
          be switched back on straight away.
        </p>
        {/* Same dead end as the client's pending screen — there has to be a way
            out that is not the browser's back button. */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Contact an admin
          </a>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Back to website
          </Link>
        </div>

        <button
          onClick={signOut}
          className="mt-5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
