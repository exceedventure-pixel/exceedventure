'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/utilities/ui'
import type { ActionResult } from '@/crm/parse'

/**
 * Interaction primitives every screen shares.
 *
 * The old CRM wrote these by hand in each of its forty-odd modals — a
 * `confirmModal` state object here, an `actionLoading` flag there, each with a
 * slightly different spinner and a slightly different way of reporting failure.
 * Centralising them means a destructive action always asks first, and a failed
 * write always says so instead of appearing to succeed.
 */

// ── Toasts ───────────────────────────────────────────────────────────────────

type Toast = { id: number; message: string; tone: 'success' | 'error' }

const ToastContext = React.createContext<(message: string, tone?: Toast['tone']) => void>(() => {})

export const useToast = () => React.useContext(ToastContext)

export const ToastHost: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = React.useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto rounded-lg border px-4 py-2.5 text-sm shadow-lg',
              t.tone === 'error'
                ? 'border-destructive/30 bg-destructive/10 text-destructive'
                : 'border-border bg-background text-foreground',
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ── Running an action ────────────────────────────────────────────────────────

/**
 * One place that runs a server action, reports the outcome and refreshes.
 *
 * Returning `ok` lets a caller chain (close a drawer, clear a field) without
 * each one re-implementing the error branch.
 */
export const useAction = () => {
  const router = useRouter()
  const toast = useToast()
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState<string | null>(null)

  const run = async (
    key: string,
    action: () => Promise<ActionResult>,
    successMessage?: string,
  ): Promise<boolean> => {
    setBusy(key)
    try {
      const result = await action()
      if (!result.ok) {
        toast(result.message, 'error')
        return false
      }
      if (successMessage) toast(successMessage)
      startTransition(() => router.refresh())
      return true
    } catch {
      toast('Something went wrong.', 'error')
      return false
    } finally {
      setBusy(null)
    }
  }

  return { run, busy, pending, isBusy: busy !== null || pending }
}

// ── Buttons ──────────────────────────────────────────────────────────────────

const TONE_CLASS = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'border border-border hover:bg-muted',
  danger: 'border border-destructive/30 text-destructive hover:bg-destructive/10',
} as const

export type ActionTone = keyof typeof TONE_CLASS

/**
 * A button that runs a server action, optionally behind a confirmation.
 *
 * `confirm` turns the button into a two-step: the first click swaps it for
 * "Sure?" / "Cancel" in place. An inline confirm rather than a modal, because
 * these live inside table rows where a dialog is more disruptive than the
 * action it guards.
 */
export const ActionButton: React.FC<{
  action: () => Promise<ActionResult>
  children: React.ReactNode
  tone?: ActionTone
  confirm?: string
  success?: string
  className?: string
  size?: 'sm' | 'md'
}> = ({ action, children, tone = 'secondary', confirm, success, className, size = 'sm' }) => {
  const { run, isBusy } = useAction()
  const [asking, setAsking] = useState(false)

  const base = cn(
    'rounded-md font-medium transition-colors disabled:opacity-50',
    size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-4 py-2 text-sm',
    TONE_CLASS[tone],
    className,
  )

  if (asking && confirm) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">{confirm}</span>
        <button
          type="button"
          disabled={isBusy}
          onClick={async () => {
            const ok = await run('confirm', action, success)
            if (ok) setAsking(false)
          }}
          className={cn(base, TONE_CLASS.danger)}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => setAsking(false)}
          className={cn(base, TONE_CLASS.secondary)}
        >
          No
        </button>
      </span>
    )
  }

  return (
    <button
      type="button"
      disabled={isBusy}
      onClick={() => (confirm ? setAsking(true) : run('go', action, success))}
      className={base}
    >
      {children}
    </button>
  )
}

/**
 * A row of one-click state changes — invoice status, project stage, request
 * decision. Replaces three near-identical components the demo had.
 */
export const ActionChoices: React.FC<{
  options: { label: string; value: string; tone?: ActionTone }[]
  onChoose: (value: string) => Promise<ActionResult>
  success?: string
}> = ({ options, onChoose, success }) => {
  const { run, busy, isBusy } = useAction()

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          disabled={isBusy}
          onClick={() => run(o.value, () => onChoose(o.value), success)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50',
            TONE_CLASS[o.tone ?? 'secondary'],
          )}
        >
          {busy === o.value ? '…' : o.label}
        </button>
      ))}
    </div>
  )
}

/** A select that commits on change — for statuses inside a table row. */
export const StatusSelect: React.FC<{
  value: string
  options: { label: string; value: string }[]
  onChange: (value: string) => Promise<ActionResult>
  success?: string
}> = ({ value, options, onChange, success }) => {
  const { run, isBusy } = useAction()

  return (
    <select
      value={value}
      disabled={isBusy}
      onChange={(e) => run('change', () => onChange(e.target.value), success)}
      className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium capitalize outline-none focus:border-primary/50 disabled:opacity-50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
