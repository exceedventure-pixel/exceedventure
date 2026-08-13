export type ServiceColor =
  'teal' | 'red' | 'blue' | 'purple' | 'emerald' | 'amber' | 'pink' | 'indigo'

/**
 * Per-service accent classes.
 *
 * Every value is a literal string on purpose — Tailwind scans source text, so
 * anything built by interpolation (`bg-${color}-500`) is dropped at build time.
 * Shared by the hero and the feature grids so a page reads as one colour.
 */
export type ServiceColorTokens = {
  /** Large icon tile in the hero and section headers. */
  iconBox: string
  /** Small uppercase pill. */
  badge: string
  /** Solid primary button. Pair with `text-white` at the call site. */
  cta: string
  /** Accent text — the second half of an H1, checklist ticks. */
  accent: string
  /** Section top-rule gradient stop. */
  divider: string
  /** Feature card hover state. */
  card: string
  /** Feature card icon tile. */
  cardIcon: string
  /** Blurred background orb behind the hero. */
  glow: string
  /** Faint accent wash for the hero's proof panel. */
  soft: string
  /** Accent-tinted border for the proof panel. */
  ring: string
  /** Small solid dot — list markers, step numbers. */
  dot: string
}

export const colorMap: Record<ServiceColor, ServiceColorTokens> = {
  teal: {
    iconBox: 'bg-teal-500/10 text-teal-500',
    badge: 'text-teal-600 bg-teal-500/10 dark:text-teal-400',
    cta: 'bg-teal-500 hover:bg-teal-600 hover:shadow-teal-500/25 focus-visible:outline-teal-500',
    accent: 'text-teal-500',
    divider: 'via-teal-500',
    card: 'hover:border-teal-500/50 hover:shadow-teal-500/5',
    cardIcon: 'bg-teal-500/10 text-teal-500',
    glow: 'bg-teal-500/20',
    soft: 'bg-teal-500/5',
    ring: 'border-teal-500/25',
    dot: 'bg-teal-500',
  },
  red: {
    iconBox: 'bg-red-500/10 text-red-500',
    badge: 'text-red-600 bg-red-500/10 dark:text-red-400',
    cta: 'bg-red-500 hover:bg-red-600 hover:shadow-red-500/25 focus-visible:outline-red-500',
    accent: 'text-red-500',
    divider: 'via-red-500',
    card: 'hover:border-red-500/50 hover:shadow-red-500/5',
    cardIcon: 'bg-red-500/10 text-red-500',
    glow: 'bg-red-500/20',
    soft: 'bg-red-500/5',
    ring: 'border-red-500/25',
    dot: 'bg-red-500',
  },
  blue: {
    iconBox: 'bg-blue-500/10 text-blue-500',
    badge: 'text-blue-600 bg-blue-500/10 dark:text-blue-400',
    cta: 'bg-blue-500 hover:bg-blue-600 hover:shadow-blue-500/25 focus-visible:outline-blue-500',
    accent: 'text-blue-500',
    divider: 'via-blue-500',
    card: 'hover:border-blue-500/50 hover:shadow-blue-500/5',
    cardIcon: 'bg-blue-500/10 text-blue-500',
    glow: 'bg-blue-500/20',
    soft: 'bg-blue-500/5',
    ring: 'border-blue-500/25',
    dot: 'bg-blue-500',
  },
  purple: {
    iconBox: 'bg-purple-500/10 text-purple-500',
    badge: 'text-purple-600 bg-purple-500/10 dark:text-purple-400',
    cta: 'bg-purple-500 hover:bg-purple-600 hover:shadow-purple-500/25 focus-visible:outline-purple-500',
    accent: 'text-purple-500',
    divider: 'via-purple-500',
    card: 'hover:border-purple-500/50 hover:shadow-purple-500/5',
    cardIcon: 'bg-purple-500/10 text-purple-500',
    glow: 'bg-purple-500/20',
    soft: 'bg-purple-500/5',
    ring: 'border-purple-500/25',
    dot: 'bg-purple-500',
  },
  emerald: {
    iconBox: 'bg-emerald-500/10 text-emerald-500',
    badge: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
    cta: 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-500/25 focus-visible:outline-emerald-500',
    accent: 'text-emerald-500',
    divider: 'via-emerald-500',
    card: 'hover:border-emerald-500/50 hover:shadow-emerald-500/5',
    cardIcon: 'bg-emerald-500/10 text-emerald-500',
    glow: 'bg-emerald-500/20',
    soft: 'bg-emerald-500/5',
    ring: 'border-emerald-500/25',
    dot: 'bg-emerald-500',
  },
  amber: {
    iconBox: 'bg-amber-500/10 text-amber-500',
    badge: 'text-amber-600 bg-amber-500/10 dark:text-amber-400',
    cta: 'bg-amber-500 hover:bg-amber-600 hover:shadow-amber-500/25 focus-visible:outline-amber-500',
    accent: 'text-amber-500',
    divider: 'via-amber-500',
    card: 'hover:border-amber-500/50 hover:shadow-amber-500/5',
    cardIcon: 'bg-amber-500/10 text-amber-500',
    glow: 'bg-amber-500/20',
    soft: 'bg-amber-500/5',
    ring: 'border-amber-500/25',
    dot: 'bg-amber-500',
  },
  pink: {
    iconBox: 'bg-pink-500/10 text-pink-500',
    badge: 'text-pink-600 bg-pink-500/10 dark:text-pink-400',
    cta: 'bg-pink-500 hover:bg-pink-600 hover:shadow-pink-500/25 focus-visible:outline-pink-500',
    accent: 'text-pink-500',
    divider: 'via-pink-500',
    card: 'hover:border-pink-500/50 hover:shadow-pink-500/5',
    cardIcon: 'bg-pink-500/10 text-pink-500',
    glow: 'bg-pink-500/20',
    soft: 'bg-pink-500/5',
    ring: 'border-pink-500/25',
    dot: 'bg-pink-500',
  },
  indigo: {
    iconBox: 'bg-indigo-500/10 text-indigo-500',
    badge: 'text-indigo-600 bg-indigo-500/10 dark:text-indigo-400',
    cta: 'bg-indigo-500 hover:bg-indigo-600 hover:shadow-indigo-500/25 focus-visible:outline-indigo-500',
    accent: 'text-indigo-500',
    divider: 'via-indigo-500',
    card: 'hover:border-indigo-500/50 hover:shadow-indigo-500/5',
    cardIcon: 'bg-indigo-500/10 text-indigo-500',
    glow: 'bg-indigo-500/20',
    soft: 'bg-indigo-500/5',
    ring: 'border-indigo-500/25',
    dot: 'bg-indigo-500',
  },
}
