'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { AUTO_SCROLL_MS } from './useLiveFrame'

/**
 * The unattended tour: three cards at a time scroll themselves, picked at
 * random.
 *
 * This is the only thing that moves a card. Hovering used to scroll one and no
 * longer does — pointing at something is not a request for it to move — so the
 * tour is the section's whole argument that these are real, running sites,
 * rather than a fallback for people who did not happen to hover.
 *
 * A pointer freezes the card under it (see useLiveFrame) but does not stop the
 * tour: pausing everything meant the rest of the batch was yanked home the
 * moment the cursor entered the grid, which is movement caused by hovering —
 * the exact thing being removed. The hovered card is skipped when picking
 * instead, so a batch never spends one of its slots on a card that is pinned
 * and cannot move.
 *
 * Returns a ref for the grid: the tour observes its children, so a card is only
 * ever picked while it is actually on screen. Without that, most of a phone's
 * passes would play three cards below the fold.
 */

/** Between one batch settling back and the next being picked. */
const GAP_MS = 1200
/** Enough of a card on screen to be worth touring. */
const VISIBLE_RATIO = 0.55

/**
 * How many cards run together. Capped by what is on screen, so a phone showing
 * two cards tours those rather than sitting still waiting for a third.
 *
 * Three rather than two now the grid is four across: with two running, half a
 * desktop row was always still, and a section whose whole argument is "these
 * are live sites" reads better with most of the row in motion. It is still a
 * batch and not "all of them" on purpose — a grid where every card moves at
 * once is a wall of movement with nothing to rest the eye on.
 */
const BATCH = 3

/**
 * Offset between the cards in a batch.
 *
 * Thumbnails starting on the same frame at the same speed read as one sliding
 * panel rather than as separate pages being browsed — the same trap the hero
 * loop staggers its lines to avoid. A beat between them is what makes it look
 * composed instead of mechanical.
 *
 * Shorter than it was, because the batch grew: the tour waits out the whole
 * stagger before the next pick, so three cards at 450ms each added nearly a
 * second of dead time to every cycle.
 */
const STAGGER_MS = 340

/** Stable identity: a fresh [] every render would re-arm the timer forever. */
const NONE: number[] = []

export function useAutoTour(count: number) {
  const gridRef = useRef<HTMLDivElement>(null)

  /** The cards currently running, in start order — position sets the stagger. */
  const [active, setActive] = useState<number[]>(NONE)
  /** Any card at all on screen — the gate; `visible` holds which ones. */
  const [anyVisible, setAnyVisible] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  const visible = useRef<Set<number>>(new Set())
  /** The batch that just ran — skipped next time, if there is a choice. */
  const last = useRef<number[]>(NONE)
  /**
   * The card under the pointer, if any. A ref rather than state: nothing
   * re-renders when it changes — it is read once, at the moment of a pick.
   */
  const hoveredCard = useRef<number | null>(null)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  // ─── Which cards are on screen ─────────────────────────────────────────────

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const cards = Array.from(grid.children)
    const index = new Map<Element, number>(cards.map((el, i) => [el, i]))

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = index.get(entry.target)
          if (i === undefined) continue
          if (entry.isIntersecting) visible.current.add(i)
          else visible.current.delete(i)
        }
        setAnyVisible(visible.current.size > 0)
      },
      { threshold: VISIBLE_RATIO },
    )
    cards.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
      visible.current.clear()
    }
  }, [count])

  // A background tab must not keep animating: the transitions are cheap, but
  // the timers would march the tour through every card while nobody is looking.
  useEffect(() => {
    const sync = () => setHidden(document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  const pick = useCallback((): number[] => {
    // A pinned card cannot move, so touring it would quietly shrink the batch.
    const onScreen = [...visible.current].filter((i) => i !== hoveredCard.current)
    if (!onScreen.length) return NONE

    const size = Math.min(BATCH, onScreen.length)

    /*
     * Prefer cards that did not just run, but only while there are enough of
     * them to fill a batch. Insisting on it would starve a phone showing three
     * cards, which would then alternate between the same trio and a standstill.
     */
    const fresh = onScreen.filter((i) => !last.current.includes(i))
    const pool = fresh.length >= size ? fresh : onScreen

    const batch: number[] = []
    const remaining = [...pool]
    while (batch.length < size && remaining.length) {
      const [choice] = remaining.splice(Math.floor(Math.random() * remaining.length), 1)
      batch.push(choice)
    }

    last.current = batch
    return batch
  }, [])

  // ─── The tour ──────────────────────────────────────────────────────────────

  const running = anyVisible && !hidden && !reducedMotion && count > 0

  useEffect(() => {
    if (!running) {
      // Scrolled away, tabbed out, or reduced motion: release everything and
      // let it settle back to the top.
      setActive(NONE)
      return
    }

    // One timer, re-armed by its own state change: while a batch is running the
    // wait is the length of its pass — the last card to start finishes last, so
    // the stagger has to be paid back here — and otherwise the gap between them.
    const timer = setTimeout(
      () => setActive((current) => (current.length ? NONE : pick())),
      active.length ? AUTO_SCROLL_MS + (active.length - 1) * STAGGER_MS : GAP_MS,
    )
    return () => clearTimeout(timer)
  }, [running, active, pick])

  /**
   * When card `i` should start, or null if the tour is not on it.
   *
   * Its position in the batch, so the cards of one batch set off a beat apart
   * rather than in lockstep.
   */
  const autoDelayFor = useCallback(
    (i: number): number | null => {
      const position = active.indexOf(i)
      return position === -1 ? null : position * STAGGER_MS
    },
    [active],
  )

  /**
   * Which card the pointer is on, reported by the cards themselves.
   *
   * Deliberately not `setState`: this must not re-render the grid, and the only
   * reader is `pick`, which runs long after the pointer moved.
   */
  const onCardHover = useCallback((index: number, isHovered: boolean) => {
    if (isHovered) hoveredCard.current = index
    else if (hoveredCard.current === index) hoveredCard.current = null
  }, [])

  return { gridRef, autoDelayFor, onCardHover }
}
