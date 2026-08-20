'use client'

import React, { useEffect, useRef, useState } from 'react'

import { cn } from '@/utilities/ui'

/**
 * A hand-drawn rule under a phrase, drawn on when it comes into view.
 *
 * Wraps the words it underlines rather than sitting beside them, so the stroke
 * is always exactly as wide as the phrase however the type reflows.
 *
 * Two things make it read as a marker stroke rather than a border:
 *
 *   - The path lifts at both ends and bows through the middle, the way a line
 *     drawn in one pass does. `vector-effect="non-scaling-stroke"` keeps the
 *     weight even, because the box is stretched to the phrase's width — without
 *     it the stroke would thin or fatten with the length of the words.
 *   - It draws left to right instead of fading up as a finished shape, which is
 *     what the `drawn-rule` keyframe in globals.css does.
 *
 * The observer is what makes it a *draw*: the animation is a one-shot, so
 * starting it at mount means a rule further down the page has finished long
 * before anyone scrolls to it. Remount with a `key` to replay it — the hero
 * loop does exactly that on every slide.
 */
export const DrawnRule: React.FC<{
  children: React.ReactNode
  /** Sits on the wrapper, so the caller sets the stroke colour with `text-*`. */
  className?: string
}> = ({ children, className }) => {
  const ref = useRef<HTMLSpanElement>(null)
  const [drawn, setDrawn] = useState(false)

  useEffect(() => {
    // A rule that draws itself is decoration; reduced motion gets it finished.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDrawn(true)
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        setDrawn(true)
      },
      { threshold: 0.6 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <span ref={ref} className={cn('relative inline-block', className)}>
      {children}
      <svg
        viewBox="0 0 300 16"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
        className="absolute left-0 top-[calc(100%+0.04em)] h-[0.36em] w-full overflow-visible"
      >
        <path
          d="M3 5.4C62 12.4 152 13.6 208 11.2c30-1.3 59-3.6 89-6.6"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          // Normalises the path to a length of 1 so the draw-on dash maths is
          // exact. Guessing it in the stylesheet left the last sixth of the
          // stroke sitting inside the dash *gap*, and the rule stopped short of
          // the word it underlines.
          pathLength={1}
          className={cn('drawn-rule', drawn && 'drawn-rule--drawn')}
        />
      </svg>
    </span>
  )
}
