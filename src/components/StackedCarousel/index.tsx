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
  { id: 1, text: 'BUSINESS WEBSITES', image: '/assets/carousel/image-1.png', description: 'Building high-performance websites' },
  { id: 2, text: 'CREATIVE POSTERS', image: '/assets/carousel/image-2.png', description: 'Engaging content and business growth' },
  { id: 3, text: 'Web Systems', image: '/assets/carousel/image-3.png', description: 'Scalable and robust web architectures' },
  { id: 4, text: 'BRAND IDENTITY', image: '/assets/carousel/image-4.png', description: 'Impactful branding that tells your story' },
  { id: 5, text: 'CORPORATE DOCUMENTS', image: '/assets/carousel/image-5.png', description: 'Impress your clients with professionalism' },
  { id: 6, text: 'SPECIAL BRANCHES', image: '/assets/carousel/image-6.png', description: 'Streamlining workflows with smart specialized branches' },
  { id: 7, text: 'Corporate Design', image: '/assets/carousel/image-7.png', description: 'Corporate social media design that aligns with your brand' },
]

const AUTOPLAY_MS = 3500
const DRAG_STEP_PX = 60 // horizontal distance that advances one slide
const CLICK_TOLERANCE_PX = 6 // movement under this counts as a click, not a drag

export const StackedCarousel = () => {
  const data = CAROUSEL_DATA
  const total = data.length

  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [dragDelta, setDragDelta] = useState(0)

  const dragging = useRef(false)
  const startX = useRef(0)
  const moved = useRef(false)

  const goTo = useCallback(
    (index: number) => setActiveIndex(((index % total) + total) % total),
    [total],
  )
  const next = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex])
  const prev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex])

  // Autoplay — restarts whenever activeIndex changes (so a click/drag resets the timer)
  useEffect(() => {
    if (paused) return
    const timer = setTimeout(() => setActiveIndex((i) => (i + 1) % total), AUTOPLAY_MS)
    return () => clearTimeout(timer)
  }, [activeIndex, paused, total])

  // Keyboard support when focused
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev()
    else if (e.key === 'ArrowRight') next()
  }

  // Unified pointer drag
  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    moved.current = false
    startX.current = e.clientX
    setPaused(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > CLICK_TOLERANCE_PX) moved.current = true
    setDragDelta(dx)
  }

  const endDrag = (e: React.PointerEvent) => {
    if (!dragging.current) return
    dragging.current = false
    const dx = e.clientX - startX.current
    setDragDelta(0)
    if (Math.abs(dx) > DRAG_STEP_PX) {
      const steps = Math.round(dx / (DRAG_STEP_PX * 2))
      goTo(activeIndex - (steps || (dx < 0 ? -1 : 1)))
    }
    setPaused(false)
  }

  const handleCardClick = (index: number) => {
    if (moved.current) return // it was a drag, not a click
    goTo(index)
  }

  const getCardStyles = (index: number): React.CSSProperties => {
    let offset = index - activeIndex
    if (offset > total / 2) offset -= total
    if (offset < -total / 2) offset += total
    // live drag influence (300px drag ≈ one slide)
    const pos = offset - dragDelta / 300

    const abs = Math.abs(pos)
    const translateX = pos * 55 // percent spacing between cards
    const scale = Math.max(0.7, 1 - abs * 0.12)
    const zIndex = 100 - Math.round(abs * 10)
    const opacity = abs > 2.4 ? 0 : 1

    return {
      transform: `translateX(${translateX}%) scale(${scale})`,
      zIndex,
      opacity,
      visibility: abs > 3 ? 'hidden' : 'visible',
    }
  }

  return (
    <div className="relative isolate z-0 flex w-full items-center justify-center bg-transparent py-2 md:py-12">
      <div
        className="relative flex h-[300px] w-full max-w-5xl items-center justify-center overflow-visible outline-none md:h-[450px]"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        onKeyDown={onKeyDown}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className={`relative flex h-full w-full touch-pan-y select-none items-center justify-center ${dragging.current ? 'cursor-grabbing' : 'cursor-grab'}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {data.map((item, index) => {
            let offset = index - activeIndex
            if (offset > total / 2) offset -= total
            if (offset < -total / 2) offset += total
            const isCenter = Math.abs(offset - dragDelta / 300) < 0.5

            return (
              <div
                key={item.id}
                className={`card-wrapper absolute w-[280px] md:w-[340px] lg:w-[400px] ${dragging.current ? '' : 'transition-all duration-500 ease-out'} ${isCenter ? 'center-slide' : ''}`}
                style={getCardStyles(index)}
                aria-hidden={!isCenter}
              >
                <button
                  type="button"
                  className="card-card group block w-full appearance-none p-0 text-left"
                  onClick={() => handleCardClick(index)}
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
                    />
                    {!isCenter && (
                      <div className="card-overlay" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }} />
                    )}
                  </div>

                  <div className="text-section bg-background">
                    <h3 className="text-xl font-bold uppercase tracking-wide text-foreground md:text-2xl">
                      {item.text}
                    </h3>
                    <div className={`transition-opacity duration-500 ${isCenter ? 'opacity-100' : 'opacity-0'}`}>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
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
        <div className="absolute -bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
          {data.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-foreground/20 hover:bg-foreground/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default StackedCarousel
