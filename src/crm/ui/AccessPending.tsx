'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock, Home, PauseCircle, XCircle } from 'lucide-react'
import siteConfig from '@/config/site'

/**
 * Shown to a client whose account exists but is not active.
 *
 * The old demo scattered these states across the dashboard as banners. Giving
 * each one a single calm screen means a person always knows exactly where they
 * stand, and never sees a half-empty dashboard they cannot explain.
 */

const STATES: Record<string, { icon: typeof Clock; title: string; body: string; tone: string }> = {
  pending: {
    icon: Clock,
    title: "You're on the list",
    body: 'Your account is waiting for approval. We usually review new accounts within one business day, and you will get an email as soon as it is ready.',
    tone: 'text-blue-600 bg-blue-500/10',
  },
  paused: {
    icon: PauseCircle,
    title: 'Access paused',
    body: 'Your access has been paused for the moment. Get in touch and we will sort it out.',
    tone: 'text-amber-600 bg-amber-500/10',
  },
  rejected: {
    icon: XCircle,
    title: 'Access not granted',
    body: 'We could not approve this account. If you think that is a mistake, please contact us.',
    tone: 'text-red-600 bg-red-500/10',
  },
}

export const AccessPending: React.FC<{ status: string }> = ({ status }) => {
  const router = useRouter()
  const state = STATES[status] ?? STATES.pending
  const Icon = state.icon

  const signOut = async () => {
    await fetch('/portal/api/logout', { method: 'POST' }).catch(() => undefined)
    router.push('/portal/login')
    router.refresh()
  }

  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 text-center">
        <span
          className={`mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full ${state.tone}`}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="text-lg font-semibold">{state.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{state.body}</p>

        {/*
         * Going back to the site is the primary action: there is nothing to do
         * in the portal until the account is approved, and without a way out
         * this screen is a dead end — the only escape was the browser's back
         * button or editing the URL.
         *
         * Sign out sits below as a quiet link. It is the rarer intent, and
         * giving it equal weight invites people to click it and lose the
         * session they just created.
         */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Back to website
          </Link>
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Contact us
          </a>
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
