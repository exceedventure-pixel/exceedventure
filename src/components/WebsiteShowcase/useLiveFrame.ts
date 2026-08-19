'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Drives one showcase card: the scale-to-fit maths, the scroll, and when (if
 * ever) to mount a live iframe.
 *
 * The trick behind the whole section: you cannot scroll inside a cross-origin
 * iframe. So instead of scrolling it, we render it at a fixed 1440 x 2600 CSS
 * px — big enough that the top of the page paints in full — scale it down to
 * the card, and translate the element upward inside a clipping frame. The
 * document never actually scrolls; it just moves.
 *
 * Only the section's tour moves a card (see useAutoTour). Hovering deliberately
 * does not: it stops the card exactly where it stands, and it stays there until
 * the pointer leaves. Pointing at something is not a request for it to start
 * moving — and a card that scrolled under the cursor made a link people were
 * aiming at into a moving target.
 */

/** The design width we screenshot at and render the iframe at. */
export const CAPTURE_WIDTH = 1440

/** Scroll pace, in iframe px per second. Reads as unhurried browsing. */
const SCROLL_SPEED = 420
/** Settling back to the top of the page once a card is released. */
const RETURN_DURATION = 700

/**
 * How long one unattended pass takes.
 *
 * Fixed rather than derived from the travel: the tour releases the card on
 * exactly this clock, and a card whose pass finished seconds early would sit
 * there looking stalled.
 */
export const AUTO_SCROLL_MS = 5200

/**
 * How far one pass travels: a glance down the page, not the whole document.
 *
 * Derived from the pace and the pass length rather than picked, so every card
 * moves at the same speed. Without the cap, a 5200px screenshot and a 2600px
 * one would cover their very different distances in the same five seconds, and
 * the tour would visibly change gear from card to card.
 */
const AUTO_TRAVEL = (SCROLL_SPEED * AUTO_SCROLL_MS) / 1000

const EASE_DOWN = 'cubic-bezier(0.32, 0.08, 0.24, 1)'
const EASE_BACK = 'cubic-bezier(0.22, 1, 0.36, 1)'

/** Long enough to ignore a cursor sweeping across the grid. */
const HOVER_INTENT_MS = 120
/** A site that has not painted by now is not going to rescue the hover. */
const LOAD_TIMEOUT_MS = 9000
/** Drop cold frames — frees the slot, and shrinks the tab-order leak below. */
const IDLE_UNMOUNT_MS = 60_000

/**
 * Four live frames is already four entire websites running their JS on our
 * homepage. Raising this shows up directly in INP.
 */
const MAX_LIVE_FRAMES = 4

let liveFrames = 0
const claimSlot = () => {
  if (liveFrames >= MAX_LIVE_FRAMES) return false
  liveFrames += 1
  return true
}
const releaseSlot = () => {
  liveFrames = Math.max(0, liveFrames - 1)
}

type Options = {
  canEmbed: boolean
  posterHeight: number
  viewportHeight: number
  /**
   * The tour has this card: how long to wait before setting off, in ms, or null
   * when it does not. Scrolls the poster; never mounts an iframe.
   */
  autoDelay: number | null
}

export function useLiveFrame({ canEmbed, posterHeight, viewportHeight, autoDelay }: Options) {
  const auto = autoDelay !== null
  const frameRef = useRef<HTMLDivElement>(null)
  /** The element that actually translates — read to freeze it where it stands. */
  const shifterRef = useRef<HTMLDivElement>(null)

  const [size, setSize] = useState({ width: 0, height: 0 })
  const [hovered, setHovered] = useState(false)
  /** Where the card was when the pointer arrived, in iframe px. */
  const [frozenAt, setFrozenAt] = useState<number | null>(null)
  const [live, setLive] = useState(false)
  const [loaded, setLoaded] = useState(false)

  /**
   * Both start false so the server render and the first client render agree —
   * matchMedia does not exist during SSR. They settle on mount, before any
   * hover is possible.
   */
  const [hoverCapable, setHoverCapable] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [saveData, setSaveData] = useState(false)

  const intentTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdsSlot = useRef(false)
  /** One failed load is enough — never retry that site for this page view. */
  const failed = useRef(false)

  // ─── Capability gates ──────────────────────────────────────────────────────

  useEffect(() => {
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const sync = () => {
      setHoverCapable(hoverQuery.matches)
      setReducedMotion(motionQuery.matches)
    }
    sync()

    // Not just read once: a user can flip the OS setting with the page open,
    // and a hybrid laptop switches between touch and trackpad.
    hoverQuery.addEventListener('change', sync)
    motionQuery.addEventListener('change', sync)

    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    setSaveData(Boolean(connection?.saveData))

    return () => {
      hoverQuery.removeEventListener('change', sync)
      motionQuery.removeEventListener('change', sync)
    }
  }, [])

  // ─── Measure ───────────────────────────────────────────────────────────────

  useEffect(() => {
    const el = frameRef.current
    if (!el) return

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // ─── Timers ────────────────────────────────────────────────────────────────

  const clear = (ref: { current: ReturnType<typeof setTimeout> | null }) => {
    if (ref.current) {
      clearTimeout(ref.current)
      ref.current = null
    }
  }

  const dropFrame = useCallback(() => {
    setLive(false)
    setLoaded(false)
    if (holdsSlot.current) {
      releaseSlot()
      holdsSlot.current = false
    }
  }, [])

  useEffect(
    () => () => {
      clear(intentTimer)
      clear(loadTimer)
      clear(idleTimer)
      if (holdsSlot.current) {
        releaseSlot()
        holdsSlot.current = false
      }
    },
    [],
  )

  // ─── Maths ─────────────────────────────────────────────────────────────────

  const scale = size.width > 0 ? size.width / CAPTURE_WIDTH : 0

  /**
   * A live iframe stays a hover-only reward. The tour visits cards nobody asked
   * about, and mounting a whole third-party site on a timer — repeatedly, on
   * every visitor — is a cost the poster does not have and does not visibly
   * differ from.
   */
  const canGoLive = canEmbed && hoverCapable && !reducedMotion && !saveData

  /**
   * How much content there is to scroll through, in iframe px.
   *
   * Deliberately derived from `canGoLive` rather than from `live`/`loaded`:
   * those flip while a pointer is on the card, and a target that changed
   * underneath would make it jump. This way the poster and the iframe cover
   * exactly the same distance, so the crossfade between them is invisible.
   */
  const contentHeight = canGoLive ? Math.min(viewportHeight, posterHeight) : posterHeight

  /** Frame height converted back into iframe px — how much of the page shows. */
  const visibleHeight = scale > 0 ? size.height / scale : 0
  const travel = Math.max(0, contentHeight - visibleHeight)

  /**
   * `hovered` is gated on `hoverCapable` because pointerenter fires on a tap
   * too, and a touch visitor would freeze a card by trying to scroll past it.
   * The tour needs no such gate — that is how a phone gets the motion at all.
   */
  const held = hovered && hoverCapable

  /**
   * Hovering pins the card where it stands. `frozenAt` is the offset read off
   * the element as the pointer arrived, applied with no transition; animating
   * it home instead would still be movement under the cursor, which is the
   * whole thing being avoided. It settles back only once the pointer leaves.
   */
  const shift = held
    ? (frozenAt ?? 0)
    : auto && !reducedMotion
      ? Math.min(travel, AUTO_TRAVEL)
      : 0

  const duration = held ? 0 : auto ? AUTO_SCROLL_MS : RETURN_DURATION
  const easing = auto && !held ? EASE_DOWN : EASE_BACK
  /** Only ever on the way out. Coming back is immediate, from wherever it is. */
  const delay = auto && !held ? (autoDelay ?? 0) : 0

  // ─── Hover ─────────────────────────────────────────────────────────────────

  /** Current offset in iframe px, straight off the compositor. */
  const measureShift = useCallback(() => {
    const el = shifterRef.current
    if (!el) return 0
    const { transform } = getComputedStyle(el)
    if (!transform || transform === 'none') return 0
    try {
      // translateY is negative on the element; the offset is its magnitude.
      return -new DOMMatrixReadOnly(transform).m42
    } catch {
      return 0
    }
  }, [])

  const onPointerEnter = useCallback(() => {
    clear(idleTimer)
    // Before the state change, so the card is pinned in the same commit that
    // drops its transition rather than a frame later.
    if (hoverCapable) setFrozenAt(measureShift())
    setHovered(true)

    if (!canGoLive || live || failed.current) return

    // The poster is already on screen, so nothing here waits for the network.
    // The iframe fades in behind it once it has painted.
    intentTimer.current = setTimeout(() => {
      if (!claimSlot()) return // Budget full — the poster alone is fine.
      holdsSlot.current = true
      setLive(true)

      loadTimer.current = setTimeout(() => {
        failed.current = true
        dropFrame()
      }, LOAD_TIMEOUT_MS)
    }, HOVER_INTENT_MS)
  }, [canGoLive, hoverCapable, live, dropFrame, measureShift])

  const onPointerLeave = useCallback(() => {
    clear(intentTimer)
    setHovered(false)
    setFrozenAt(null)

    // The iframe stays mounted: reloading it on every hover would flash white
    // and hammer the client's server. It goes when the card has been cold for
    // a while.
    if (live) idleTimer.current = setTimeout(dropFrame, IDLE_UNMOUNT_MS)
  }, [live, dropFrame])

  const onFrameLoad = useCallback(() => {
    clear(loadTimer)
    setLoaded(true)
  }, [])

  return {
    frameRef,
    shifterRef,
    scale,
    shift,
    duration,
    delay,
    easing,
    live,
    loaded,
    onPointerEnter,
    onPointerLeave,
    onFrameLoad,
  }
}
