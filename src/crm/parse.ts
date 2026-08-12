/**
 * Form parsing shared by every server action.
 *
 * Kept out of the `'use server'` files on purpose: Next requires every export of
 * a server-action module to be an async function, so plain helpers cannot live
 * beside the actions they support.
 */

export type ActionResult = { ok: true; id?: string | number } | { ok: false; message: string }

export const fail = (err: unknown): ActionResult => ({
  ok: false,
  message: err instanceof Error ? err.message : 'Something went wrong.',
})

export const str = (v: FormDataEntryValue | null): string => (typeof v === 'string' ? v.trim() : '')

export const num = (v: FormDataEntryValue | null): number | undefined => {
  const s = str(v)
  if (s === '') return undefined
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}

/** Money arrives from forms as pounds; everything is stored in minor units. */
export const money = (v: FormDataEntryValue | null): number | undefined => {
  const s = str(v)
  if (s === '') return undefined
  const n = Number(s)
  return Number.isFinite(n) ? Math.round(n * 100) : undefined
}

export const bool = (v: FormDataEntryValue | null): boolean => {
  const s = str(v).toLowerCase()
  return s === 'on' || s === 'true' || s === '1' || s === 'yes'
}

/** '' means "not provided", which must not overwrite an existing value with ''. */
export const optional = (v: string): string | undefined => (v === '' ? undefined : v)

/** Multi-selects and checkbox groups post the same name repeatedly. */
export const ids = (values: FormDataEntryValue[]): number[] =>
  values.map((v) => Number(str(v))).filter((n) => Number.isFinite(n))

/** Unwraps a relationship that may be an id or a populated document. */
export const relId = (value: unknown): string | number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'object') {
    const id = (value as { id?: string | number }).id
    return id ?? null
  }
  return value as string | number
}

/** A relationship's display name, when the query populated it. */
export const relName = (value: unknown, field = 'name'): string => {
  if (value && typeof value === 'object' && field in value) {
    return String((value as Record<string, unknown>)[field] ?? '')
  }
  return ''
}

/**
 * Formats minor units for an email or a toast, where JSX is not available.
 *
 * `currency` takes null as well as undefined because that is what an optional
 * Payload text field hands back.
 */
export const formatMoney = (minor?: number | null, currency?: string | null): string =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency || 'GBP' }).format(
    (minor ?? 0) / 100,
  )

/** camelCase / snake_case → readable, matching the UI's `humanise`. */
export const humaniseValue = (value?: string | null): string =>
  (value ?? '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .trim()
    .toLowerCase()
