'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface CarouselItem {
  id: number
  text: string
  image: string
  description: string
}

const CAROUSEL_DATA: CarouselItem[] = [
  {
    id: 1,
    text: 'BUSINESS WEBSITES',
    image: '/assets/carousel/image-1.png',
    description: 'Building high-performance websites',
  },
  {
    id: 2,
    text: 'CREATIVE POSTERS',
    image: '/assets/carousel/image-2.png',
    description: 'Engaging content and business growth',
  },
  {
    id: 3,
    text: 'Web Systems',
    image: '/assets/carousel/image-3.png',
    description: 'Scalable and robust web architectures',
  },
  {
    id: 4,
    text: 'BRAND IDENTITY',
    image: '/assets/carousel/image-4.png',
    description: 'Impactful branding that tells your story',
  },
  {
    id: 5,
    text: 'CORPORATE DOCUMENTS',
    image: '/assets/carousel/image-5.png',
    description: 'Impress your clients with professionalism',
  },
  {
    id: 6,
    text: 'SPECIAL BRANCHES',
    image: '/assets/carousel/image-6.png',
    description: 'Streamlining workflows with smart specialized branches',
  },
  {
    id: 7,
    text: 'Corporate Design',
    image: '/assets/carousel/image-7.png',
    description: 'Corporate social media design that aligns with your brand',
  },
]

/** Time each slide is held before auto-advancing. */
const AUTOPLAY_MS = 2200
/** How long autoplay stays out of the way after a deliberate user action. */
const RESUME_AFTER_INTERACTION_MS = 6000
/** Slide transition length. */
const TRANSITION_MS = 400

export const StackedCarousel = () => {
  const data = CAROUSEL_DATA
  const total = data.length

  const [activeIndex, setActiveIndex] = useState(0)
  const [hovering, setHovering] = useState(false)
  const [focused, setFocused] = useState(false)
  const [cooldown, setCooldown] = useState(false)
  const [docVisible, setDocVisible] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const goTo = useCallback(
    (index: number) => setActiveIndex(((index % total) + total) % total),
    [total],
  )

  /**
   * Hold autoplay off for a beat after the user acts, so the carousel follows
   * their pace instead of yanking to the next slide mid-look.
   */
  const noteInteraction = useCallback(() => {
    setCooldown(true)
    if (cooldownTimer.current) clearTimeout(cooldownTimer.current)
    cooldownTimer.current = setTimeout(() => setCooldown(false), RESUME_AFTER_INTERACTION_MS)
  }, [])

  useEffect(
    () => () => {
      if (cooldownTimer.current) clearTimeout(cooldownTimer.current)
    },
    [],
  )

  /** Every user-driven move goes through here so the cooldown can never be missed. */
  const userGoTo = useCallback(
    (index: number) => {
      goTo(index)
      noteInteraction()
    },
    [goTo, noteInteraction],
  )

  const next = useCallback(() => userGoTo(activeIndex + 1), [userGoTo, activeIndex])
  const prev = useCallback(() => userGoTo(activeIndex - 1), [userGoTo, activeIndex])

  // Respect the OS "reduce motion" setting — an auto-advancing carousel is
  // exactly the kind of movement that setting exists to stop.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Don't cycle in a tab nobody is looking at.
  useEffect(() => {
    const onVisibility = () => setDocVisible(!document.hidden)
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const paused = hovering || focused || cooldown || !docVisible || reducedMotion

  // Autoplay. Keyed on activeIndex so any move — auto or manual — restarts the
  // dwell time rather than leaving a partially elapsed timer to fire early.
  useEffect(() => {
    if (paused) return
    const timer = setTimeout(() => setActiveIndex((i) => (i + 1) % total), AUTOPLAY_MS)
    return () => clearTimeout(timer)
  }, [activeIndex, paused, total])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      next()
    }
  }

  const getCardStyles = (offset: number): React.CSSProperties => {
    const abs = Math.abs(offset)
    return {
      transform: `translateX(${offset * 55}%) scale(${Math.max(0.7, 1 - abs * 0.12)})`,
      zIndex: 100 - Math.round(abs * 10),
      opacity: abs > 2.4 ? 0 : 1,
      visibility: abs > 3 ? 'hidden' : 'visible',
      transition: reducedMotion
        ? 'none'
        : `transform ${TRANSITION_MS}ms ease-out, opacity ${TRANSITION_MS}ms ease-out`,
    }
  }

  return (
    <div className="relative isolate z-0 flex w-full items-center justify-center bg-transparent py-2 md:py-8">
      {/* Track height follows the card height (--carousel-h) plus headroom for
          the scaled-up centre slide, so the whole hero can fit one screen. */}
      <div
        className="relative flex h-[calc(var(--carousel-h)+40px)] w-full max-w-5xl items-center justify-center overflow-visible outline-none"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Our work"
        onKeyDown={onKeyDown}
        // Pause for keyboard focus only. A mouse click on an arrow also focuses
        // it, and without the :focus-visible check that would strand autoplay
        // paused for good once the pointer moved away.
        onFocus={(e) => {
          if (e.target instanceof Element && e.target.matches(':focus-visible')) setFocused(true)
        }}
        onBlur={() => setFocused(false)}
        // Pointer events rather than mouse events, guarded on type: a touch tap
        // fires enter but often never fires leave, which would strand autoplay.
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHovering(true)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setHovering(false)}
      >
        <div className="relative flex h-full w-full select-none items-center justify-center">
          {data.map((item, index) => {
            let offset = index - activeIndex
            if (offset > total / 2) offset -= total
            if (offset < -total / 2) offset += total
            const isCenter = offset === 0

            return (
              <div
                key={item.id}
                className={`card-wrapper absolute w-[280px] md:w-[340px] lg:w-[400px] ${isCenter ? 'center-slide' : ''}`}
                style={getCardStyles(offset)}
                aria-hidden={!isCenter}
              >
                <button
                  type="button"
                  className="card-card group block w-full appearance-none p-0 text-left"
                  onClick={() => userGoTo(index)}
                  tabIndex={isCenter ? 0 : -1}
                  aria-label={item.text}
                >
                  <div className="image-section">
                    <Image
                      alt={item.text}
                      className="cover-image h-full w-full object-cover"
                      src={item.image}
                      draggable={false}
                      fill
                      sizes="(max-width: 768px) 280px, (max-width: 1024px) 340px, 400px"
                      // The centre slide is the page's LCP element — the carousel
                      // sits above the hero heading — so it must not be lazy.
                      // Off-centre slides stay lazy.
                      priority={isCenter}
                    />
                    {!isCenter && (
                      <div
                        className="card-overlay"
                        style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
                      />
                    )}
                  </div>

                  <div className="text-section bg-background">
                    {/* A slide label, not document structure. As an <h3> these
                        preceded the page's <h1> (the hero heading sits below the
                        carousel), giving the homepage an H3-before-H1 outline. */}
                    <div className="truncate text-base font-bold uppercase leading-tight tracking-wide text-foreground md:text-lg">
                      {item.text}
                    </div>
                    <div
                      className={`transition-opacity duration-500 ${isCenter ? 'opacity-100' : 'opacity-0'}`}
                    >
                      <p className="mt-0.5 truncate text-xs leading-snug text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            )
          })}
        </div>

        <button className="card-button left" onClick={prev} aria-label="Previous slide">
          <ChevronLeft size={36} className="text-white" strokeWidth={1.5} />
        </button>
        <button className="card-button right" onClick={next} aria-label="Next slide">
          <ChevronRight size={36} className="text-white" strokeWidth={1.5} />
        </button>

        {/* Dots */}
        <div className="absolute -bottom-12 left-1/2 flex -translate-x-1/2 gap-1">
          {data.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => userGoTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === activeIndex}
              className="flex h-11 w-8 items-center justify-center"
            >
              <span
                className={`block h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-foreground/20 hover:bg-foreground/40'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StackedCarousel
