'use client'

import React from 'react'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

import { cn } from '@/utilities/ui'
import type { ShowcaseItem } from './types'
import { CAPTURE_WIDTH, useLiveFrame } from './useLiveFrame'

/**
 * One website card: a browser-chrome frame with the site inside it, scrolling
 * when the section's tour picks it and holding still under a pointer.
 *
 * The screenshot is never unmounted, even once the live frame is up. It is what
 * hides the white flash while the iframe paints, a slow site, and any bot
 * challenge page a client's WAF decides to serve us.
 */
export const ShowcaseCard: React.FC<{
  item: ShowcaseItem
  autoDelay: number | null
  /** Tells the tour to leave this card alone while a pointer is on it. */
  onHoverChange: (hovered: boolean) => void
}> = ({ item, autoDelay, onHoverChange }) => {
  const {
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
  } = useLiveFrame({
    canEmbed: item.canEmbed,
    posterHeight: item.posterHeight,
    viewportHeight: item.viewportHeight,
    autoDelay,
  })

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${item.title} — opens ${item.host} in a new tab`}
      onPointerEnter={() => {
        onHoverChange(true)
        onPointerEnter()
      }}
      onPointerLeave={() => {
        onHoverChange(false)
        onPointerLeave()
      }}
      className="group block rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      {/*
       * The device. Only this lifts on hover — the caption below stays put, so
       * the gesture reads as picking a screen up off the page rather than the
       * whole row shuffling.
       */}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-border bg-card',
          'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.12)]',
          'transition-all duration-500 ease-out',
          'group-hover:-translate-y-1.5 group-hover:border-primary/30',
          'group-hover:shadow-[0_2px_4px_rgba(0,0,0,0.04),0_28px_56px_-20px_rgba(0,0,0,0.28)]',
          // Safari has a long history of letting a transformed child escape a
          // border-radius + overflow-hidden ancestor. Painting the card on its
          // own layer keeps the iframe's corners clipped.
          'isolate',
        )}
      >
        {/* Browser chrome — the frame is what sells "this is a real website". */}
        <div className="flex h-9 shrink-0 items-center gap-1.5 border-b border-border bg-muted/50 px-3.5">
          <span className="h-2 w-2 rounded-full bg-[#ff5f57]/80" aria-hidden="true" />
          <span className="h-2 w-2 rounded-full bg-[#febc2e]/80" aria-hidden="true" />
          <span className="h-2 w-2 rounded-full bg-[#28c840]/80" aria-hidden="true" />
          <span className="mx-auto max-w-[70%] truncate rounded-md bg-background/70 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-muted-foreground">
            {item.displayUrl}
          </span>
          {/* Balances the three dots so the address sits optically centred. */}
          <span className="w-6.5 shrink-0" aria-hidden="true" />
        </div>

        {/*
         * The viewport. Measured, and clips everything inside it.
         *
         * An aspect ratio rather than a pixel height: the frame then holds the
         * same proportions at every breakpoint, which is what keeps six cards
         * reading as one set instead of six slightly different windows.
         */}
        <div ref={frameRef} className="relative aspect-4/3 overflow-hidden bg-muted">
        {/*
         * Scaler: a fixed 1440px-wide design space shrunk to fit the card.
         * `pointer-events-none` is not optional — without it the iframe
         * swallows the hover, eats the click that should open the site, and
         * captures the wheel, which hijacks the page scroll.
         */}
        <div
          className="pointer-events-none absolute left-0 top-0 origin-top-left"
          style={{ width: CAPTURE_WIDTH, transform: `scale(${scale})` }}
          aria-hidden="true"
        >
          {/* Shifter: the only animated element. */}
          <div
            ref={shifterRef}
            className="will-change-transform"
            style={{
              transform: `translate3d(0, ${-shift}px, 0)`,
              transition: `transform ${duration}ms ${easing} ${delay}ms`,
            }}
          >
            <Image
              src={item.posterUrl}
              alt=""
              width={CAPTURE_WIDTH}
              height={item.posterHeight}
              quality={100}
              // The poster's *layout* width is 1440 inside the pre-scale design
              // space, so without this the browser fetches a 1440–2880px source
              // for a card that renders at 400–760px.
              sizes="(min-width: 1024px) 720px, (min-width: 640px) 480px, 100vw"
              className="block h-auto w-full select-none"
              draggable={false}
            />

            {live && (
              <iframe
                src={item.url}
                title={`Live preview of ${item.title}`}
                /*
                 * `allow-same-origin` alongside `allow-scripts` is the pairing
                 * everyone warns about — but that warning is about framing a
                 * SAME-origin document, which could then reach out and strip
                 * its own sandbox attribute. These frames are cross-origin
                 * (getWebsiteShowcase refuses to embed our own origin), so this
                 * restores the embedded site's own origin and gains it nothing
                 * over us. Without it, storage and cookie access throw and a
                 * large share of real sites render blank.
                 *
                 * Everything else stays off on purpose. A client site can be
                 * sold, expire, or be compromised: without allow-top-navigation
                 * it cannot redirect our homepage, without allow-popups it
                 * cannot spawn ad windows, without allow-modals it cannot
                 * alert(), without allow-downloads it cannot push a file at a
                 * visitor. Do not add one to make a stubborn site work — switch
                 * that site to screenshot-only instead.
                 */
                sandbox="allow-scripts allow-same-origin"
                /* Empty Permissions Policy: no camera, mic, geolocation, payment. */
                allow=""
                referrerPolicy="strict-origin-when-cross-origin"
                loading="lazy"
                tabIndex={-1}
                aria-hidden="true"
                onLoad={onFrameLoad}
                style={{
                  width: CAPTURE_WIDTH,
                  height: item.viewportHeight,
                  opacity: loaded ? 1 : 0,
                }}
                className="absolute left-0 top-0 block border-0 transition-opacity duration-500"
              />
            )}
          </div>
        </div>

          {/* Only claim "live" once the real site is actually on screen. */}
          {loaded && (
            <span className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live
            </span>
          )}

          {/*
           * A whisper of shade along the bottom edge, and nothing more. The old
           * treatment was a black gradient over the lower third of every card
           * carrying the title — it buried a third of the work on a screenshot
           * that exists to be looked at, and six of them made the grid muddy.
           * This only stops a page's own white footer dissolving into the card.
           */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/12 to-transparent dark:from-black/25"
            aria-hidden="true"
          />
        </div>
      </div>

      {/*
       * The caption, below the frame where a print portfolio would set it.
       * Outside the lifting device on purpose: the type stays anchored while
       * the screen rises, which is what stops the hover feeling like a wobble.
       */}
      <div className="mt-4 flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] transition-colors duration-300 group-hover:text-primary sm:text-base">
            {item.title}
          </h3>
          {item.category && (
            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {item.category}
            </p>
          )}
        </div>

        <ArrowUpRight
          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden="true"
        />
      </div>
    </a>
  )
}
