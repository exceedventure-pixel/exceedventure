'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { LayoutGrid, List, Search, X } from 'lucide-react'
import { cn } from '@/utilities/ui'

/**
 * Search and filter controls for the list screens.
 *
 * State lives in the URL rather than in React. The old CRM held every filter in
 * component state, so a filtered list could not be linked to, bookmarked or
 * restored after a refresh — and each of the five list screens had its own
 * search box with its own quirks. Here the server component reads
 * `searchParams` and does the filtering in SQL, which also means a long list
 * never has to be shipped to the browser to be narrowed down.
 */

const useQueryParam = () => {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const set = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (!value) next.delete(key)
      else next.set(key, value)
    }
    // Any filter change invalidates the page cursor.
    next.delete('page')
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }))
  }

  return { params, set, pending }
}

export const SearchBox: React.FC<{ placeholder?: string; param?: string }> = ({
  placeholder = 'Search…',
  param = 'q',
}) => {
  const { params, set, pending } = useQueryParam()
  const initial = params.get(param) ?? ''
  const [value, setValue] = useState(initial)

  // Keeps the box in step when the URL changes from elsewhere (a cleared
  // filter, the back button) without fighting the user mid-keystroke.
  useEffect(() => setValue(initial), [initial])

  // Debounced so a five-letter search is one query, not five.
  useEffect(() => {
    if (value === initial) return
    const t = setTimeout(() => set({ [param]: value || undefined }), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          'w-full rounded-lg border border-border bg-background py-2 pl-9 pr-8 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-ring/30',
          pending && 'opacity-70',
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue('')}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export type FilterOption = { label: string; value: string; count?: number }

/** A row of pills. `''` is the "all" option and clears the parameter. */
export const FilterTabs: React.FC<{
  param: string
  options: FilterOption[]
  defaultValue?: string
}> = ({ param, options, defaultValue = '' }) => {
  const { params, set } = useQueryParam()
  const active = params.get(param) ?? defaultValue

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const selected = active === o.value
        return (
          <button
            key={o.value || 'all'}
            type="button"
            aria-pressed={selected}
            onClick={() => set({ [param]: o.value || undefined })}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors',
              selected
                ? 'bg-primary text-primary-foreground'
                : 'border border-border text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {o.label}
            {typeof o.count === 'number' && (
              <span className={cn('ml-1.5 tabular-nums', selected ? 'opacity-80' : 'opacity-60')}>
                {o.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Cards / list switch.
 *
 * The choice lives in the URL like every other filter, so it survives a refresh
 * and can be linked — a view toggle that resets every time you come back is
 * worse than no toggle.
 *
 * Cards are the default: the clean URL shows them, and `?view=list` is the
 * explicit opt-out. Keeping the default parameter-less matters because it is
 * what every internal link and every bookmark lands on.
 */
export const ViewToggle: React.FC<{ param?: string }> = ({ param = 'view' }) => {
  const { params, set } = useQueryParam()
  const active = params.get(param) === 'list' ? 'list' : 'cards'

  const options = [
    { value: 'cards', label: 'Card view', Icon: LayoutGrid },
    { value: 'list', label: 'List view', Icon: List },
  ] as const

  return (
    <div
      role="group"
      aria-label="View"
      className="inline-flex items-center gap-0.5 rounded-lg border border-border p-0.5"
    >
      {options.map(({ value, label, Icon }) => {
        const selected = active === value
        return (
          <button
            key={value}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={selected}
            // Selecting the default clears the parameter rather than writing
            // `?view=cards`, so the canonical URL stays clean.
            onClick={() => set({ [param]: value === 'cards' ? undefined : value })}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              selected
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}

/** Page N of M, as links that keep every other filter intact. */
export const Pager: React.FC<{ page: number; totalPages: number }> = ({ page, totalPages }) => {
  const { set } = useQueryParam()
  if (totalPages <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => set({ page: String(page - 1) })}
          className="rounded-md border border-border px-2.5 py-1 font-medium transition-colors hover:bg-muted disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => set({ page: String(page + 1) })}
          className="rounded-md border border-border px-2.5 py-1 font-medium transition-colors hover:bg-muted disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
