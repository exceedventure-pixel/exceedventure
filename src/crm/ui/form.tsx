'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/utilities/ui'
import type { ActionResult } from '@/crm/parse'

/**
 * Form primitives shared by every create/edit screen.
 *
 * `ActionForm` wraps a server action so each form gets pending state, an error
 * message and a refresh for free — the thing the old CRM repeated by hand in
 * every modal, slightly differently each time.
 */

export const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-ring/30'

export const Field: React.FC<{
  label: string
  children: React.ReactNode
  hint?: string
  className?: string
}> = ({ label, children, hint, className }) => (
  <label className={cn('block', className)}>
    <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
  </label>
)

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={cn(inputClass, props.className)} />
)

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea rows={3} {...props} className={cn(inputClass, 'resize-y', props.className)} />
)

export const Select: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement> & { options: { label: string; value: string }[] }
> = ({ options, ...props }) => (
  <select {...props} className={cn(inputClass, props.className)}>
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
)

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }
> = ({ variant = 'primary', className, ...props }) => (
  <button
    {...props}
    className={cn(
      'rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60',
      variant === 'primary'
        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
        : 'border border-border hover:bg-muted',
      className,
    )}
  />
)

export const ActionForm: React.FC<{
  action: (form: FormData) => Promise<ActionResult>
  children: React.ReactNode
  submitLabel?: string
  onDone?: () => void
  className?: string
}> = ({ action, children, submitLabel = 'Save', onDone, className }) => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true)
    setError(null)

    const result = await action(new FormData(e.currentTarget))

    if (!result.ok) {
      setError(result.message)
      setBusy(false)
      return
    }

    // The action revalidates on the server; refresh pulls the new data in.
    startTransition(() => router.refresh())
    setBusy(false)
    onDone?.()
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {error}
        </p>
      )}
      <div className="mt-4 flex items-center gap-2">
        <Button type="submit" disabled={busy || pending}>
          {busy || pending ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

/** A right-hand drawer for create/edit forms — keeps the list visible behind it. */
export const Drawer: React.FC<{
  trigger: React.ReactNode
  title: string
  children: (close: () => void) => React.ReactNode
}> = ({ trigger, title, children }) => {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={close} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onKeyDown={(e) => e.key === 'Escape' && close()}
            className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-background shadow-xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background px-5 py-4">
              <h2 className="text-sm font-semibold">{title}</h2>
              <button
                onClick={close}
                aria-label="Close"
                className="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>
            <div className="p-5">{children(close)}</div>
          </div>
        </div>
      )}
    </>
  )
}
