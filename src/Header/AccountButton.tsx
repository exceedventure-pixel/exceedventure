'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Avatar } from '@/components/Avatar'

/**
 * Header control for the client dashboard: "Login" to a guest, "Dashboard" to
 * someone already signed in.
 *
 * The session is resolved in the browser, and it has to be. Nearly every
 * marketing page is `force-static`, and under `force-static` Next hands server
 * code an empty cookie jar — a server-side session read would quietly report
 * "signed out" for everyone, forever. Reading it client-side also keeps these
 * pages servable straight from the CDN cache.
 *
 * Uses the portal's own /portal/api/me — Payload's shared-cookie endpoint would
 * answer for whichever area wrote the cookie last.
 * It answers null unless the token belongs to `client-accounts` specifically,
 * so a CMS editor or a staff CRM session does not light this up — same rule the
 * server-side `getAccount` enforces.
 */

export type PortalAccount = { name?: string | null; email: string }

/**
 * Remembers across page loads that *someone* was signed in, so the header can
 * paint the account state on the first frame instead of visibly flipping from
 * "Login" when the request lands. Only a boolean — never a name or an email.
 * A stale "yes" costs nothing: the fetch corrects it, and /portal bounces a
 * signed-out visitor to the login page anyway.
 */
const HINT_KEY = 'ev:portal-session'

const hint = {
  read: (): boolean => {
    try {
      return window.localStorage.getItem(HINT_KEY) === '1'
    } catch {
      return false
    }
  },
  write: (signedIn: boolean): void => {
    try {
      if (signedIn) window.localStorage.setItem(HINT_KEY, '1')
      else window.localStorage.removeItem(HINT_KEY)
    } catch {
      /* Safari private mode and friends — the fetch still works. */
    }
  },
}

/** Shared so the bar and the drawer make one request between them, not two. */
let pending: Promise<PortalAccount | null> | null = null

const readSession = (): Promise<PortalAccount | null> => {
  pending ??= fetch('/portal/api/me', { credentials: 'include' })
    .then((res) => (res.ok ? res.json() : null))
    .then((body) => (body?.user ?? null) as PortalAccount | null)
    .catch(() => null)
    .finally(() => {
      // Cleared once settled, so remounting after a trip to /portal re-checks
      // rather than serving a session answer from before the user logged out.
      pending = null
    })

  return pending
}

export const usePortalSession = (): { signedIn: boolean; account: PortalAccount | null } => {
  // Starts false on both sides of hydration — the hint is applied in the effect
  // below, where the server render can no longer disagree with it.
  const [signedIn, setSignedIn] = useState(false)
  const [account, setAccount] = useState<PortalAccount | null>(null)

  useEffect(() => {
    let alive = true

    if (hint.read()) setSignedIn(true)

    void readSession().then((user) => {
      if (!alive) return
      setSignedIn(Boolean(user))
      setAccount(user)
      hint.write(Boolean(user))
    })

    return () => {
      alive = false
    }
  }, [])

  return { signedIn, account }
}

/** The friendliest label we have: a first name, else the email. */
export const displayNameFor = (account: PortalAccount | null): string => {
  const name = account?.name?.trim()
  if (name) return name.split(/\s+/)[0]!
  return account?.email?.split('@')[0] ?? 'Account'
}

/**
 * Signs out of the client dashboard from the public site.
 *
 * Clears the local "signed in" hint as well as the cookie — leaving it set
 * would make the header paint "Dashboard" on the next page load before the
 * fetch corrected it, which looks like the sign-out did not work.
 */
export const signOutPortal = async (): Promise<void> => {
  await fetch('/portal/api/logout', { method: 'POST' }).catch(() => undefined)
  hint.write(false)
  pending = null
}

// Both states share one pill so the header never reflows when they swap.
const pill =
  'inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:gap-2 sm:px-4 sm:py-2'

export const AccountButton: React.FC = () => {
  const { signedIn, account } = usePortalSession()

  if (!signedIn) {
    return (
      <Link
        href="/portal/login"
        // The dashboard is a separate app from the marketing site — opening it
        // in its own tab means someone reading a services page does not lose it
        // to a login form, and can close the dashboard to find the site still
        // where they left it.
        target="_blank"
        // `noopener` matters: without it the opened tab can reach back through
        // window.opener and navigate this one.
        rel="noopener noreferrer"
        aria-label="Login or sign up to the client dashboard (opens in a new tab)"
        className={pill}
      >
        <Avatar size={20} tone="onPrimary" />
        <span className="hidden sm:inline">Login</span>
      </Link>
    )
  }

  return (
    <Link
      href="/portal"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open your client dashboard (opens in a new tab)"
      className={pill}
    >
      <Avatar size={20} tone="onPrimary" />
      <span className="hidden sm:inline">Dashboard</span>
    </Link>
  )
}
