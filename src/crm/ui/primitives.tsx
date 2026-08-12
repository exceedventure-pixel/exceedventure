import React from 'react'
import Link from 'next/link'
import { cn } from '@/utilities/ui'

/**
 * Shared building blocks for the CRM and portal screens.
 *
 * These carry the whole visual hierarchy, so a screen only has to say *what* it
 * is showing, never how to weight it. The first version was flat — page titles,
 * section headings and table headers all read at roughly the same volume, so a
 * dense page gave you no way in. The rules now:
 *
 *   Page header  — largest thing on the page, with an icon and a breadcrumb.
 *   Section      — a heading with an icon, always the same size.
 *   Card         — raised off the tinted page ground, so blocks are separable.
 *   Numbers      — tabular and right-aligned, so columns scan vertically.
 */

// ── Page chrome ──────────────────────────────────────────────────────────────

export type Crumb = { label: string; href?: string }

export const Breadcrumbs: React.FC<{ items: Crumb[] }> = ({ items }) => (
  <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs">
    {items.map((item, i) => (
      <React.Fragment key={`${item.label}-${i}`}>
        {i > 0 && <span className="text-muted-foreground/50">/</span>}
        {item.href ? (
          <Link href={item.href} className="text-muted-foreground hover:text-foreground">
            {item.label}
          </Link>
        ) : (
          <span className="text-foreground">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
)

/**
 * The top of every screen.
 *
 * `icon` is the quickest "what is this page" signal there is — far faster than
 * reading a title — so it sits in a tinted tile in the area's own accent.
 */
export const PageHeader: React.FC<{
  title: string
  description?: string
  icon?: React.ReactNode
  breadcrumbs?: Crumb[]
  action?: React.ReactNode
}> = ({ title, description, icon, breadcrumbs, action }) => (
  <div className="mb-6">
    {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-primary [&>svg]:h-4.5 [&>svg]:w-4.5"
            style={{ backgroundColor: 'var(--area-tint)' }}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  </div>
)

/**
 * A titled block. Every group of content on a page goes in one of these, so
 * the eye can find the seams — previously sections were bare `<h2>`s with
 * inconsistent spacing and no visual anchor.
 */
export const Section: React.FC<{
  title: string
  icon?: React.ReactNode
  action?: React.ReactNode
  description?: string
  className?: string
  children: React.ReactNode
}> = ({ title, icon, action, description, className, children }) => (
  <section className={cn('min-w-0', className)}>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div className="min-w-0">
        <h2 className="area-section-title">
          {icon && (
            <span aria-hidden="true" className="text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
              {icon}
            </span>
          )}
          {title}
        </h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
)

// ── Surfaces ─────────────────────────────────────────────────────────────────

export const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => <div className={cn('area-card', className)}>{children}</div>

/**
 * A single figure. The label is quiet, the number is loud, and an optional icon
 * gives the row of them some rhythm rather than four identical grey boxes.
 */
export const StatCard: React.FC<{
  label: string
  value: React.ReactNode
  hint?: string
  icon?: React.ReactNode
  /** Draws attention when the number is the point (overdue, awaiting you). */
  emphasis?: boolean
}> = ({ label, value, hint, icon, emphasis }) => (
  <Card className={cn('p-4', emphasis && 'border-primary/30')}>
    <div className="flex items-start justify-between gap-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      {icon && (
        <span aria-hidden="true" className="text-muted-foreground/60 [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      )}
    </div>
    <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </Card>
)

// ── Status ───────────────────────────────────────────────────────────────────

/**
 * Status pills. Colours are literal so Tailwind keeps them.
 *
 * Each carries a dot as well as a hue: at this size a tint alone is easy to
 * misread, and impossible to read at all if the two hues look the same to you.
 */
const TONES = {
  neutral: { chip: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground/50' },
  info: { chip: 'bg-blue-500/10 text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  success: {
    chip: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  warning: { chip: 'bg-amber-500/10 text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  danger: { chip: 'bg-red-500/10 text-red-700 dark:text-red-300', dot: 'bg-red-500' },
} as const

export type Tone = keyof typeof TONES

export const Badge: React.FC<{
  tone?: Tone
  children: React.ReactNode
  dot?: boolean
}> = ({ tone = 'neutral', children, dot = true }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
      TONES[tone].chip,
    )}
  >
    {dot && (
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', TONES[tone].dot)} />
    )}
    {children}
  </span>
)

/** One place that maps every status string to a tone, so colours stay consistent. */
export const toneFor = (status?: string | null): Tone => {
  switch (status) {
    case 'active':
    case 'paid':
    case 'complete':
    case 'completed':
    case 'accepted':
    case 'done':
      return 'success'
    case 'pending':
    case 'sent':
    case 'inProgress':
    case 'review':
    case 'new':
    case 'planning':
    case 'proposal':
      return 'info'
    case 'onHold':
    case 'paused':
    case 'blocked':
    case 'overdue':
    case 'pendingApproval':
      return 'warning'
    case 'rejected':
    case 'declined':
    case 'cancelled':
    case 'void':
      return 'danger'
    default:
      return 'neutral'
  }
}

/** Turns camelCase / snake_case statuses into readable labels. */
export const humanise = (value?: string | null): string =>
  (value ?? '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .trim() || '—'

// ── Empty states ─────────────────────────────────────────────────────────────

export const EmptyState: React.FC<{
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}> = ({ title, description, icon, action }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
    {icon && (
      <span
        aria-hidden="true"
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground [&>svg]:h-5 [&>svg]:w-5"
        style={{ backgroundColor: 'var(--area-tint)' }}
      >
        {icon}
      </span>
    )}
    <p className="text-sm font-medium">{title}</p>
    {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)

// ── Tables ───────────────────────────────────────────────────────────────────

/**
 * `align` marks which columns are numeric so they right-align and use tabular
 * figures — a money column that does not line up is unreadable at a glance.
 */
export const Table: React.FC<{
  headers: (string | { label: string; align?: 'left' | 'right' })[]
  children: React.ReactNode
}> = ({ headers, children }) => (
  <Card className="overflow-hidden">
    {/* Wide tables scroll inside the card rather than the page. */}
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="area-thead border-b border-border text-left">
            {headers.map((h, i) => {
              const label = typeof h === 'string' ? h : h.label
              const align = typeof h === 'string' ? 'left' : (h.align ?? 'left')
              return (
                <th
                  key={`${label}-${i}`}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground',
                    align === 'right' && 'text-right',
                  )}
                >
                  {label}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  </Card>
)

/** Standard row. Keeps hover and padding identical everywhere. */
export const Row: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => <tr className={cn('transition-colors hover:bg-muted/40', className)}>{children}</tr>

export const Cell: React.FC<{
  className?: string
  align?: 'left' | 'right'
  muted?: boolean
  children: React.ReactNode
}> = ({ className, align = 'left', muted, children }) => (
  <td
    className={cn(
      'px-4 py-2.5',
      align === 'right' && 'area-num',
      muted && 'text-muted-foreground',
      className,
    )}
  >
    {children}
  </td>
)

// ── Values ───────────────────────────────────────────────────────────────────

export const Money: React.FC<{ minor?: number | null; currency?: string | null }> = ({
  minor,
  currency = 'GBP',
}) => {
  // Amounts are stored in minor units — divide only at the point of display.
  const value = (minor ?? 0) / 100
  return (
    <span className="tabular-nums">
      {new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: currency || 'GBP',
      }).format(value)}
    </span>
  )
}

export const DateText: React.FC<{ value?: string | null; overdue?: boolean }> = ({
  value,
  overdue,
}) => {
  if (!value) return <span className="text-muted-foreground">—</span>
  return (
    <span className={cn('whitespace-nowrap', overdue && 'font-medium text-red-600')}>
      {new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}
    </span>
  )
}

/** A thin progress bar — for task completion and project progress. */
export const Progress: React.FC<{ value: number; label?: string }> = ({ value, label }) => {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
      >
        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{pct}%</span>
    </div>
  )
}
