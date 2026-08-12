'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/utilities/ui'

/**
 * Shared sign-in for both areas.
 *
 * Password login posts to Payload's own `/api/<collection>/login`, which sets
 * the session cookie. Signup posts to the portal route that creates a new
 * company. Google is a plain link — the OAuth redirect must be a full
 * navigation, not a fetch.
 */

const ERRORS: Record<string, string> = {
  not_invited: 'That Google account has no CRM access. Ask an admin to add you.',
  email_unverified: 'That Google address is not verified.',
  wrong_domain: 'Use your company Google account.',
  bad_state: 'Sign-in expired. Please try again.',
  identity_mismatch: 'That email is already linked to a different Google account.',
  not_configured: 'Google sign-in is not configured on this environment.',
  no_code: 'Google sign-in was cancelled.',
  no_profile: 'Could not read your Google profile.',
}

const field =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-ring/30'

export const LoginForm: React.FC<{
  title: string
  subtitle: string
  loginEndpoint: string
  redirectTo: string
  /** Omitted when Google is not configured — the button is then hidden. */
  googleHref?: string
  forgotPasswordHref: string
  allowSignup?: boolean
  /** `?mode=signup` opens straight on the create-account tab. */
  initialMode?: 'login' | 'signup'
  error?: string
}> = ({
  title,
  subtitle,
  loginEndpoint,
  redirectTo,
  googleHref,
  forgotPasswordHref,
  allowSignup,
  initialMode,
  error,
}) => {
  const router = useRouter()
  // Honours the link that sent you here — the drawer's "Sign up" button should
  // land on the signup tab, not on a login form you then have to switch.
  const [mode, setMode] = useState<'login' | 'signup'>(
    allowSignup && initialMode === 'signup' ? 'signup' : 'login',
  )
  const [message, setMessage] = useState<string | null>(error ? (ERRORS[error] ?? error) : null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    setNotice(null)

    const data = Object.fromEntries(new FormData(e.currentTarget))

    try {
      const res = await fetch(
        mode === 'signup' ? '/portal/api/signup' : loginEndpoint,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
      )

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setMessage(body.message || 'Those details were not accepted.')
        setBusy(false)
        return
      }

      // 202 means "already registered" — deliberately indistinguishable from a
      // fresh signup so the endpoint cannot be used to enumerate clients.
      if (mode === 'signup' && res.status === 202) {
        const body = await res.json().catch(() => ({}))
        setNotice(body.message || 'You can now sign in.')
        setMode('login')
        setBusy(false)
        return
      }

      router.push(redirectTo)
      router.refresh()
    } catch {
      setMessage('Could not reach the server.')
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            EV
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6">
          {/*
           * Both paths as a segmented control at the top, rather than the
           * "Create one" text link this used to hide at the bottom of the card.
           * Signing up was already possible — it just looked like the only real
           * options were a password you did not have and Google.
           */}
          {allowSignup && (
            <div
              role="tablist"
              aria-label="Sign in or create an account"
              className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
            >
              {(
                [
                  ['login', 'Sign in'],
                  ['signup', 'Create account'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={mode === value}
                  onClick={() => {
                    setMode(value)
                    setMessage(null)
                    setNotice(null)
                  }}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    mode === value
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <h1 className="text-lg font-semibold">
            {mode === 'signup' ? 'Create your account' : 'Sign in'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'signup'
              ? 'Sign up with your email — we review new accounts before granting access.'
              : 'Welcome back.'}
          </p>

          {message && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {message}
            </p>
          )}
          {notice && (
            <p className="mt-4 rounded-lg bg-blue-500/10 px-3 py-2 text-xs text-blue-600">
              {notice}
            </p>
          )}

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            {mode === 'signup' && (
              <>
                <input name="name" placeholder="Your name" className={field} />
                <input name="company" placeholder="Company name" className={field} />
              </>
            )}
            <input name="email" type="email" placeholder="Email" required className={field} />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              className={field}
            />
            {mode === 'login' && (
              <div className="flex justify-end">
                <Link
                  href={forgotPasswordHref}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Forgot your password?
                </Link>
              </div>
            )}
            <button
              type="submit"
              disabled={busy}
              className={cn(
                'w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60',
              )}
            >
              {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          {/* Hidden entirely when unconfigured — a button that can only fail
              is worse than no button. */}
          {googleHref && (
            <>
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <a
            href={googleHref}
            className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.14 6.16-4.14Z"
              />
            </svg>
            Continue with Google
          </a>
            </>
          )}

          {allowSignup && mode === 'signup' && (
            <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
              Signing up creates a new company record. If you already work with us, we will link
              you to the right account when we approve you.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
