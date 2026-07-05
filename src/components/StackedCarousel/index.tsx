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

export const StackedCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const data = CAROUSEL_DATA
  const totalItems = data.length

  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const startX = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalItems)
  }, [totalItems])

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems)
  }, [totalItems])

  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true)
    startX.current = clientX
    setDragOffset(0)
  }, [])

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return
      const diff = clientX - startX.current
      setDragOffset(-diff * 0.5)
    },
    [isDragging],
  )

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return
    const slidesToMove = Math.round(dragOffset / 50)
    if (slidesToMove !== 0) {
      setActiveIndex((prev) => {
        let newIndex = prev + slidesToMove
        while (newIndex < 0) newIndex += totalItems
        while (newIndex >= totalItems) newIndex -= totalItems
        return newIndex
      })
    }
    setIsDragging(false)
    setDragOffset(0)
    startX.current = 0
  }, [isDragging, dragOffset, totalItems])

  const handleCardClick = (index: number) => {
    if (!isDragging) setActiveIndex(index)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalItems)
    }, 3000)
    return () => clearInterval(interval)
  }, [totalItems])

  const getCardStyles = (index: number): React.CSSProperties => {
    let diff = index - activeIndex
    if (diff > totalItems / 2) diff -= totalItems
    if (diff < -totalItems / 2) diff += totalItems
    diff -= dragOffset / 100

    const absDiff = Math.abs(diff)
    const scale = 1 - absDiff * 0.15
    const translateX = diff * 70
    const zIndex = 10 - Math.floor(absDiff)
    const opacity = absDiff > 2 ? 0 : 1

    return {
      transform: `translateX(${translateX}%) scale(${Math.max(0.5, scale)})`,
      zIndex,
      opacity,
      visibility: absDiff > 2.5 ? 'hidden' : 'visible',
    }
  }

  return (
    <div className="flex w-full items-center justify-center bg-transparent py-2 md:py-12">
      <div className="relative flex h-[300px] w-full max-w-5xl items-center justify-center overflow-visible md:h-[450px]">
        <div
          ref={containerRef}
          className={`relative flex h-full w-full select-none items-center justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
          onMouseDown={(e) => {
            e.preventDefault()
            handleDragStart(e.clientX)
          }}
          onMouseMove={(e) => isDragging && handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onMouseLeave={() => isDragging && handleDragEnd()}
        >
          {data.map((item, index) => {
            let wrappedDiff = index - activeIndex
            if (wrappedDiff > totalItems / 2) wrappedDiff -= totalItems
            if (wrappedDiff < -totalItems / 2) wrappedDiff += totalItems
            const effectiveDiff = wrappedDiff - dragOffset / 100
            const isCenterSlide = Math.abs(effectiveDiff) < 0.5

            return (
              <div
                key={item.id}
                className={`card-wrapper absolute w-[280px] md:w-[340px] lg:w-[400px] ${!isDragging ? 'transition-all duration-500 ease-in-out' : ''} ${isCenterSlide ? 'center-slide' : ''}`}
                style={getCardStyles(index)}
              >
                <div
                  className="card-card group"
                  draggable={false}
                  onClick={(e) => {
                    e.preventDefault()
                    if (!isDragging && dragOffset === 0) handleCardClick(index)
                  }}
                  style={{
                    pointerEvents: isDragging ? 'none' : 'auto',
                    transition: isDragging ? 'none' : 'all 400ms ease',
                  }}
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
                    {!isCenterSlide && (
                      <div className="card-overlay" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }} />
                    )}
                  </div>

                  <div className="text-section bg-background">
                    <h3 className="text-xl font-bold uppercase tracking-wide text-foreground md:text-2xl">
                      {item.text}
                    </h3>
                    <div className={`transition-opacity duration-500 ${isCenterSlide ? 'opacity-100' : 'opacity-0'}`}>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button className="card-button left" onClick={handlePrev} aria-label="Previous">
          <ChevronLeft size={36} className="text-white" strokeWidth={1.5} />
        </button>
        <button className="card-button right" onClick={handleNext} aria-label="Next">
          <ChevronRight size={36} className="text-white" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

export default StackedCarousel
