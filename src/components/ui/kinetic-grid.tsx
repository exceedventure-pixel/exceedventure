'use client'

import React, { useCallback, useEffect, useRef, type ReactNode } from 'react'

import { cn } from '@/utilities/ui'

/**
 * A grid that warps toward the pointer and ripples where it is clicked.
 *
 * Adapted from a full-page background into something that can sit as one band
 * in the middle of a page. Four things had to change for that, and each would
 * have been a visible bug left as it was:
 *
 *   1. The canvas is `absolute` inside the band, not `fixed` to the window. As
 *      `fixed` it painted over every other section on the page the moment you
 *      scrolled past it.
 *   2. It is sized from the element, not `window.innerWidth/innerHeight`, so
 *      the grid fills the band rather than being cropped from a viewport-sized
 *      drawing.
 *   3. Pointer and click listeners are on the band, not `window`. A click
 *      anywhere on the site was spawning ripples in here, and coordinates were
 *      read as viewport pixels against a canvas that no longer starts at 0,0.
 *   4. The loop stops when the band is off screen. A `requestAnimationFrame`
 *      redrawing a few thousand line segments forever, while nobody is looking
 *      at it, is the kind of thing that shows up as battery drain rather than
 *      as a bug report.
 *
 * Reduced motion gets a single static frame: the grid still draws, it simply
 * never chases anything.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

interface Point {
  x: number
  y: number
}

interface Ripple {
  x: number
  y: number
  radius: number
  opacity: number
  born: number
}

interface Rgba {
  r: number
  g: number
  b: number
  a: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Grid pitch. Everything else is expressed against the cell it produces. */
const CELL_SIZE = 55
const INFLUENCE_RADIUS = 260
const MAX_WARP = 24
const DOT_SPACING = 28
/** How fast the grid's idea of the pointer catches up to the real one. */
const LERP_SPEED = 0.08

const LINE_BASE: Rgba = { r: 255, g: 255, b: 255, a: 0.13 }
const NODE_BASE: Rgba = { r: 255, g: 255, b: 255, a: 0.2 }
const NODE_BASE_RADIUS = 1.8
const NODE_ACTIVE_RADIUS = 3.2

/** Parked far off canvas, so nothing is warped until the pointer arrives. */
const AWAY: Point = { x: -9999, y: -9999 }

const THEMES = {
  default: {
    bg: '#161618',
    lineActive: { r: 74, g: 158, b: 255, a: 0.9 } as Rgba,
    nodeActive: { r: 74, g: 158, b: 255, a: 1 } as Rgba,
    glow: '74,158,255',
    ripple: '100,180,255',
  },
  monochrome: {
    bg: '#000000',
    lineActive: { r: 255, g: 255, b: 255, a: 0.9 } as Rgba,
    nodeActive: { r: 255, g: 255, b: 255, a: 1 } as Rgba,
    glow: '255,255,255',
    ripple: '255,255,255',
  },
  brand: {
    bg: '#0b0b0c',
    lineActive: { r: 0, g: 194, b: 190, a: 0.9 } as Rgba,
    nodeActive: { r: 0, g: 194, b: 190, a: 1 } as Rgba,
    glow: '0,194,190',
    ripple: '0,194,190',
  },
} as const

export type KineticGridTheme = keyof typeof THEMES

// ─── Helpers ──────────────────────────────────────────────────────────────────

const lerpN = (a: number, b: number, t: number) => a + (b - a) * t

const lerpColor = (base: Rgba, active: Rgba, t: number): string => {
  const r = Math.round(lerpN(base.r, active.r, t))
  const g = Math.round(lerpN(base.g, active.g, t))
  const b = Math.round(lerpN(base.b, active.b, t))
  return `rgba(${r},${g},${b},${lerpN(base.a, active.a, t).toFixed(3)})`
}

/** Classic smoothstep — eases both ends of a 0–1 ramp. */
const smooth = (t: number) => t * t * (3 - 2 * t)

// ─── Component ────────────────────────────────────────────────────────────────

export const KineticGrid: React.FC<{
  children?: ReactNode
  className?: string
  theme?: KineticGridTheme
}> = ({ children, className, theme = 'brand' }) => {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const mouse = useRef<Point>({ ...AWAY })
  const target = useRef<Point>({ ...AWAY })
  const ripples = useRef<Ripple[]>([])
  const raf = useRef<number>(0)
  const size = useRef({ w: 0, h: 0 })

  // ── Where one grid node ends up, and how lit it is ────────────────────────

  const warp = useCallback(
    (gx: number, gy: number, col: number, row: number, cols: number, rows: number) => {
      /*
       * Edge pin. The boundary rows and columns are held still, easing in over
       * a cell and a half, so the grid deforms inside its own frame instead of
       * tearing away from the edges of the band.
       */
      const margin = 1.5
      const colPin = Math.min(col / margin, (cols - 1 - col) / margin, 1)
      const rowPin = Math.min(row / margin, (rows - 1 - row) / margin, 1)
      const pin = colPin * colPin * rowPin * rowPin

      const m = mouse.current
      const dx = gx - m.x
      const dy = gy - m.y
      const dist = Math.hypot(dx, dy)
      const proximity = Math.max(0, 1 - dist / INFLUENCE_RADIUS) * pin

      // Ripple displacement: each ring pushes nodes along its own radius.
      let rx = 0
      let ry = 0
      for (const r of ripples.current) {
        const rdx = gx - r.x
        const rdy = gy - r.y
        const diff = Math.hypot(rdx, rdy) - r.radius
        const waveWidth = 55
        if (Math.abs(diff) < waveWidth) {
          const strength = (1 - Math.abs(diff) / waveWidth) * r.opacity * 18 * pin
          const angle = Math.atan2(rdy, rdx)
          const sign = diff < 0 ? 1 : -1
          rx += Math.cos(angle) * strength * sign
          ry += Math.sin(angle) * strength * sign
        }
      }

      if (dist < INFLUENCE_RADIUS && dist > 0 && pin > 0) {
        const t = dist / INFLUENCE_RADIUS
        // Falls off as a bell, and is damped right at the pointer so nodes do
        // not snap through it.
        const eased = t < 0.01 ? 0 : (1 - t) * (1 - t) * Math.min(1, dist / 60)
        const amt = eased * MAX_WARP * pin
        const angle = Math.atan2(dy, dx)
        return {
          pt: { x: gx - Math.cos(angle) * amt + rx, y: gy - Math.sin(angle) * amt + ry },
          proximity,
        }
      }

      return { pt: { x: gx + rx, y: gy + ry }, proximity }
    },
    [],
  )

  // ── One frame ─────────────────────────────────────────────────────────────

  const draw = useCallback(
    (now: number) => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return

      const { w: W, h: H } = size.current
      if (W === 0 || H === 0) return

      const t = THEMES[theme]

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = t.bg
      ctx.fillRect(0, 0, W, H)

      // Static dot texture, under everything.
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      for (let x = DOT_SPACING / 2; x < W; x += DOT_SPACING) {
        for (let y = DOT_SPACING / 2; y < H; y += DOT_SPACING) {
          ctx.beginPath()
          ctx.arc(x, y, 0.7, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Age the ripples, dropping the spent ones.
      for (let i = ripples.current.length - 1; i >= 0; i--) {
        const r = ripples.current[i]
        const age = (now - r.born) / 1000
        r.radius = Math.max(0, age * 400)
        r.opacity = Math.max(0, 1 - age * 1.2)
        if (r.opacity <= 0) ripples.current.splice(i, 1)
      }

      const cols = Math.max(2, Math.ceil(W / CELL_SIZE)) + 1
      const rows = Math.max(2, Math.ceil(H / CELL_SIZE)) + 1
      const cellW = W / (cols - 1)
      const cellH = H / (rows - 1)

      const pts: Point[][] = []
      const prox: number[][] = []
      for (let row = 0; row < rows; row++) {
        pts[row] = []
        prox[row] = []
        for (let col = 0; col < cols; col++) {
          const { pt, proximity } = warp(col * cellW, row * cellH, col, row, cols, rows)
          pts[row][col] = pt
          prox[row][col] = proximity
        }
      }

      const seg = (p1: Point, p2: Point, a: number, b: number) => {
        const k = smooth((a + b) / 2)
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.strokeStyle = lerpColor(LINE_BASE, t.lineActive, k)
        ctx.lineWidth = lerpN(0.8, 1.5, k)
        ctx.stroke()
      }

      ctx.lineCap = 'butt'
      for (let row = 0; row < rows; row++)
        for (let col = 0; col < cols - 1; col++)
          seg(pts[row][col], pts[row][col + 1], prox[row][col], prox[row][col + 1])
      for (let col = 0; col < cols; col++)
        for (let row = 0; row < rows - 1; row++)
          seg(pts[row][col], pts[row + 1][col], prox[row][col], prox[row + 1][col])

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const p = pts[row][col]
          const k = smooth(prox[row][col])
          const r = lerpN(NODE_BASE_RADIUS, NODE_ACTIVE_RADIUS, k)

          if (k > 0.3) {
            const glowR = r + lerpN(0, 6, (k - 0.3) / 0.7)
            const grd = ctx.createRadialGradient(p.x, p.y, r * 0.5, p.x, p.y, glowR)
            grd.addColorStop(0, `rgba(${t.glow},${(k * 0.3).toFixed(3)})`)
            grd.addColorStop(1, `rgba(${t.glow},0)`)
            ctx.beginPath()
            ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2)
            ctx.fillStyle = grd
            ctx.fill()
          }

          ctx.beginPath()
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
          ctx.fillStyle = lerpColor(NODE_BASE, t.nodeActive, k)
          ctx.fill()
        }
      }

      for (const r of ripples.current) {
        ctx.beginPath()
        ctx.arc(r.x, r.y, Math.max(0, r.radius), 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${t.ripple},${(r.opacity * 0.28).toFixed(3)})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    },
    [theme, warp],
  )

  // ── Sizing, input, and the loop ───────────────────────────────────────────

  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return

    /*
     * Backing store scaled to the device pixel ratio, with the context scaled
     * to match so every coordinate below stays in CSS pixels. Without it the
     * hairlines are visibly soft on any retina screen.
     */
    const resize = () => {
      const { width, height } = host.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      size.current = { w: width, h: height }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Coordinates are relative to the band, not the window: the canvas no
    // longer starts at the top-left of the viewport.
    const toLocal = (e: PointerEvent): Point => {
      const rect = host.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const onMove = (e: PointerEvent) => {
      target.current = toLocal(e)
    }
    const onLeave = () => {
      target.current = { ...AWAY }
    }
    const onDown = (e: PointerEvent) => {
      if (reduced.matches) return
      const p = toLocal(e)
      ripples.current.push({ ...p, radius: 0, opacity: 1, born: performance.now() })
    }

    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerdown', onDown)

    let running = false
    const frame = (now: number) => {
      const m = mouse.current
      const tg = target.current
      m.x = lerpN(m.x, tg.x, LERP_SPEED)
      m.y = lerpN(m.y, tg.y, LERP_SPEED)
      draw(now)
      raf.current = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running || reduced.matches) return
      running = true
      raf.current = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      if (raf.current) cancelAnimationFrame(raf.current)
    }

    // Only animate while the band is actually on screen.
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), {
      threshold: 0,
    })
    io.observe(host)

    const onVisibility = () => (document.hidden ? stop() : io.takeRecords(), undefined)
    document.addEventListener('visibilitychange', onVisibility)

    // Reduced motion still gets the grid, just never a moving one.
    if (reduced.matches) draw(performance.now())

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerdown', onDown)
    }
  }, [draw])

  return (
    <div ref={hostRef} className={cn('relative isolate overflow-hidden', className)}>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full" />
      {children}
    </div>
  )
}

export default KineticGrid
