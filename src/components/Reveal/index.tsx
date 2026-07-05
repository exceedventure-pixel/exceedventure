'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/utilities/ui'

interface RevealProps {
  children: React.ReactNode
  className?: string
  /** Delay in ms before the reveal transition begins. */
  delay?: number
  /** Amount of the element visible before it triggers (0–1). */
  threshold?: number
}

/**
 * Lightweight, dependency-free scroll-reveal. Fades + slides its children in
 * once when they first enter the viewport. Respects `prefers-reduced-motion`
 * via the global CSS rule that neutralises transitions.
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  className,
  delay = 0,
  threshold = 0.15,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-700 ease-out will-change-transform motion-reduce:transition-none',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        className,
      )}
    >
      {children}
    </div>
  )
}
