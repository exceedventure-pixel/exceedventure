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
/** Slide transition length, once the carousel is live. */
const TRANSITION_MS = 400

/**
 * The assembly — cards flying in from both edges to form the stack.
 *
 * Runs once, the first time the section is scrolled into view. Long and heavily
 * eased, because it is the one moment this component is a piece of motion
 * rather than a control: 950ms out of the gate hard and settling slow, with the
 * wings arriving a beat behind the centre so the stack builds outwards instead
 * of snapping into place all at once.
 */
const ASSEMBLE_MS = 950
/** Per-rank delay. Rank 0 is the centre card, which lands first. */
const ASSEMBLE_STAGGER_MS = 90
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)'

/** How far off-screen a wing starts, in viewport widths. */
const FLY_IN_VW = 68

type Phase = 'idle' | 'assembling' | 'live'

export const StackedCarousel = () => {
  const data = CAROUSEL_DATA
  const total = data.length

  const [activeIndex, setActiveIndex] = useState(0)
  const [hovering, setHovering] = useState(false)
  const [focused, setFocused] = useState(false)
  const [cooldown, setCooldown] = useState(false)
  const [docVisible, setDocVisible] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)

  /**
   * Cards sit off-screen until the section is scrolled to, then assemble once
   * and never again. Autoplay is held off until 'live', so the first slide
   * cannot advance out from under the animation that is still introducing it.
   */
  const [phase, setPhase] = useState<Phase>('idle')
  const trackRef = useRef<HTMLDivElement>(null)
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

  /**
   * Trigger the assembly the first time the stack is meaningfully on screen.
   *
   * A low threshold on purpose: the cards start two thirds of a viewport out to
   * each side, so waiting until the track itself is half visible would mean the
   * wings fly in from somewhere the reader has already scrolled past.
   */
  useEffect(() => {
    if (reducedMotion) {
      // The fly-in is exactly the kind of movement the setting exists to stop,
      // and a stack that never assembles would simply never appear.
      setPhase('live')
      return
    }

    const el = trackRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        setPhase('assembling')
      },
      {
        // Tall elements satisfy a small threshold the instant their top edge
        // clears the bottom of the window, which ran the whole animation while
        // the reader was still scrolling toward it. The negative bottom margin
        // pulls the trip line a fifth of the way up the window instead, so it
        // starts when the section is actually being looked at.
        threshold: 0.2,
        rootMargin: '0px 0px -20% 0px',
      },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reducedMotion])

  // Hand over to normal carousel behaviour once every card has landed.
  useEffect(() => {
    if (phase !== 'assembling') return
    const timer = setTimeout(() => setPhase('live'), ASSEMBLE_MS + ASSEMBLE_STAGGER_MS * 3)
    return () => clearTimeout(timer)
  }, [phase])

  // Don't cycle in a tab nobody is looking at.
  useEffect(() => {
    const onVisibility = () => setDocVisible(!document.hidden)
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const paused = hovering || focused || cooldown || !docVisible || reducedMotion || phase !== 'live'

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
    const zIndex = 100 - Math.round(abs * 10)

    /*
     * Waiting to be assembled: parked off the edge it will arrive from, turned
     * a few degrees and scaled back, so the fly-in reads as cards being dealt
     * rather than panels sliding along a rail. The centre card has no side to
     * come from, so it rises instead.
     *
     * No transition at all here — this is a resting position the browser paints
     * once, and the movement belongs entirely to the change out of it.
     */
    if (phase === 'idle') {
      const dir = Math.sign(offset)
      return {
        transform: dir
          ? `translateX(${dir * FLY_IN_VW}vw) rotate(${dir * 7}deg) scale(0.86)`
          : 'translateY(3.5rem) scale(0.9)',
        zIndex,
        opacity: 0,
        transition: 'none',
      }
    }

    return {
      transform: `translateX(${offset * 55}%) scale(${Math.max(0.7, 1 - abs * 0.12)})`,
      zIndex,
      opacity: abs > 2.4 ? 0 : 1,
      visibility: abs > 3 ? 'hidden' : 'visible',
      transition: reducedMotion
        ? 'none'
        : phase === 'assembling'
          ? `transform ${ASSEMBLE_MS}ms ${EASE_OUT} ${abs * ASSEMBLE_STAGGER_MS}ms, opacity ${ASSEMBLE_MS}ms ease-out ${abs * ASSEMBLE_STAGGER_MS}ms`
          : `transform ${TRANSITION_MS}ms ease-out, opacity ${TRANSITION_MS}ms ease-out`,
      willChange: phase === 'assembling' ? 'transform, opacity' : undefined,
    }
  }

  return (
    <div className="relative isolate z-0 flex w-full items-center justify-center bg-transparent">
      {/* Track height follows the card height (--carousel-h) plus headroom for
          the scaled-up centre slide, so the whole hero can fit one screen. */}
      <div
        ref={trackRef}
        className="relative flex h-[calc(var(--carousel-h)+40px)] w-full max-w-6xl items-center justify-center overflow-visible outline-none"
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
                      // Lazy, all of them. This used to be the page's LCP
                      // element when the carousel sat above the hero heading;
                      // it now lives well below the fold, where `priority`
                      // would preload an image nobody has scrolled to yet.
                      loading="lazy"
                    />
                    {!isCenter && <div className="card-overlay" />}
                  </div>

                  <div className="text-section">
                    {/* A slide label, not document structure. As an <h3> these
                        preceded the page's <h1> (the hero heading sits below the
                        carousel), giving the homepage an H3-before-H1 outline. */}
                    <div className="truncate text-xs font-semibold uppercase leading-tight tracking-[0.16em] text-foreground md:text-sm">
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
          <ChevronLeft size={20} strokeWidth={1.75} />
        </button>
        <button className="card-button right" onClick={next} aria-label="Next slide">
          <ChevronRight size={20} strokeWidth={1.75} />
        </button>

        {/* Dots */}
        <div className="absolute -bottom-14 left-1/2 flex -translate-x-1/2 gap-1">
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
