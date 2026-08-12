'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

/**
 * Forgot-password and reset-password, shared by /crm and /portal.
 *
 * Without this, email-and-password sign-in is a trap: forget the password and
 * the only way back is asking someone to reset it by hand.
 *
 * The request step ALWAYS reports success, whether or not the address exists.
 * Saying "no account with that email" turns the form into a way to test which
 * of your clients have accounts, which is the same reason signup returns 202
 * for an address already registered.
 */

const field =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-ring/30'

const Shell: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
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
      <div className="rounded-2xl border border-border bg-background p-6">{children}</div>
    </div>
  </div>
)

export const ForgotPasswordForm: React.FC<{
  title: string
  collection: 'crm-accounts' | 'client-accounts'
  loginPath: string
}> = ({ title, collection, loginPath }) => {
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true)
    const email = String(new FormData(e.currentTarget).get('email') ?? '')
      .trim()
      .toLowerCase()

    // The response is ignored on purpose — see the note above. A failure here
    // must look identical to a success.
    await fetch(`/api/${collection}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => undefined)

    setBusy(false)
    setSent(true)
  }

  return (
    <Shell title={title} subtitle="Reset your password">
      {sent ? (
        <>
          <h1 className="text-lg font-semibold">Check your email</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            If that address has an account, a reset link is on its way. It is valid for one hour.
          </p>
          <Link
            href={loginPath}
            className="mt-5 block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground"
          >
            Back to sign in
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-lg font-semibold">Forgot your password?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email and we will send you a link to set a new one.
          </p>
          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Email"
              className={field}
            />
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
          <Link
            href={loginPath}
            className="mt-5 block text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to sign in
          </Link>
        </>
      )}
    </Shell>
  )
}

export const ResetPasswordForm: React.FC<{
  title: string
  /** This area's own reset route — Payload's would set the shared cookie. */
  resetEndpoint: string
  loginPath: string
  forgotPath: string
  redirectTo: string
  token?: string
}> = ({ title, resetEndpoint, loginPath, forgotPath, redirectTo, token }) => {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const form = new FormData(e.currentTarget)
    const password = String(form.get('password') ?? '')
    const confirm = String(form.get('confirm') ?? '')

    if (password.length < 10) return setError('Use at least 10 characters.')
    if (password !== confirm) return setError('The two passwords do not match.')

    setBusy(true)
    try {
      const res = await fetch(resetEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (!res.ok) {
        setError('That link has expired or already been used. Request a new one.')
        setBusy(false)
        return
      }
      // The route issues this area's session as part of the reset, so the
      // person lands signed in rather than at a login form.
      router.push(redirectTo)
      router.refresh()
    } catch {
      setError('Could not reach the server.')
      setBusy(false)
    }
  }

  if (!token) {
    return (
      <Shell title={title} subtitle="Reset your password">
        <h1 className="text-lg font-semibold">Link not valid</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This reset link is missing its token. Request a fresh one.
        </p>
        <Link
          href={forgotPath}
          className="mt-5 block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground"
        >
          Request a new link
        </Link>
      </Shell>
    )
  }

  return (
    <Shell title={title} subtitle="Reset your password">
      <h1 className="text-lg font-semibold">Set a new password</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose something you have not used elsewhere.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {error}
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="New password"
          className={field}
        />
        <input
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Confirm new password"
          className={field}
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Set password and sign in'}
        </button>
      </form>

      <Link
        href={loginPath}
        className="mt-5 block text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        Back to sign in
      </Link>
    </Shell>
  )
}
