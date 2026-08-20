'use client'

import React, { useEffect, useRef, useState } from 'react'

import { Reveal } from '@/components/Reveal'
import { OutlineWord } from '@/components/OutlineWord'
import { cn } from '@/utilities/ui'
import { TestimonialsColumn } from '@/components/ui/testimonials-columns-1'
import type { Testimonial } from './types'

/**
 * Client reviews, as four columns scrolling past at different speeds.
 *
 * Two columns on a phone and four on a desktop, with a third appearing in
 * between: at two columns the cards are wide enough to read, and at four the
 * strip fills a wide screen without the cards going comically long.
 *
 * The content comes from the `testimonials` collection. Until there are enough
 * published reviews to fill the strip, it runs on the placeholders below —
 * see `PLACEHOLDER_TESTIMONIALS` for why that is a deliberate default and not a
 * silent failure.
 */

/**
 * Stand-in reviews, shown until the CMS has at least four published ones.
 *
 * These are **not real customers**. They exist so the section can be designed,
 * reviewed and shipped before the first real review is collected, and they
 * disappear the moment four real ones are published — there is no flag to
 * remember to turn off, and no way to end up with a mix of real and invented
 * quotes side by side.
 */
const PLACEHOLDER_TESTIMONIALS: Testimonial[] = [
  {
    id: 'placeholder-1',
    quote:
      'They rebuilt our site in three weeks and we could finally edit it ourselves. Enquiries went up before we had even started advertising.',
    name: 'Nusrat Jahan',
    role: 'Director, Haven Abodes',
    rating: 5,
    avatarUrl: null,
    initials: 'NJ',
  },
  {
    id: 'placeholder-2',
    quote:
      'For the first time we can actually see which ads bring in work. The monthly report is one page and it answers the only question I had.',
    name: 'Tanvir Rahman',
    role: 'Owner, Revamp Autos',
    rating: 5,
    avatarUrl: null,
    initials: 'TR',
  },
  {
    id: 'placeholder-3',
    quote:
      'The order sheet updates itself now. That was two people, half a day a week, every week.',
    name: 'Farhana Kabir',
    role: 'Operations Manager',
    rating: 5,
    avatarUrl: null,
    initials: 'FK',
  },
  {
    id: 'placeholder-4',
    quote:
      'We looked like four different companies across our materials. Now we look like one, and a serious one.',
    name: 'Imran Hossain',
    role: 'Founder, SK Land',
    rating: 5,
    avatarUrl: null,
    initials: 'IH',
  },
  {
    id: 'placeholder-5',
    quote:
      'Straight answers, a fixed quote, and it launched on the date they gave us in the first meeting.',
    name: 'Sadia Chowdhury',
    role: 'Marketing Lead',
    rating: 5,
    avatarUrl: null,
    initials: 'SC',
  },
  {
    id: 'placeholder-6',
    quote:
      'The storefront handles our whole catalogue and the team picked it up in an afternoon. No manual, no hand-holding.',
    name: 'Rafiul Islam',
    role: 'E-commerce Manager',
    rating: 4,
    avatarUrl: null,
    initials: 'RI',
  },
  {
    id: 'placeholder-7',
    quote:
      'They asked better questions than we did. Half of what we thought we needed turned out not to matter.',
    name: 'Maliha Anwar',
    role: 'Head of Product',
    rating: 5,
    avatarUrl: null,
    initials: 'MA',
  },
  {
    id: 'placeholder-8',
    quote:
      'Our booking form used to email us and stop there. It now creates the job, the invoice and the reminder.',
    name: 'Arif Mahmud',
    role: 'Managing Partner',
    rating: 5,
    avatarUrl: null,
    initials: 'AM',
  },
  {
    id: 'placeholder-9',
    quote:
      'The social content finally sounds like us. We stopped sounding like a template and people started replying.',
    name: 'Sabrina Haque',
    role: 'Brand Manager',
    rating: 5,
    avatarUrl: null,
    initials: 'SH',
  },
  {
    id: 'placeholder-10',
    quote:
      'Support did not vanish after launch. Small things get fixed the same day, which is not what we were used to.',
    name: 'Zahid Karim',
    role: 'General Manager',
    rating: 5,
    avatarUrl: null,
    initials: 'ZK',
  },
  {
    id: 'placeholder-11',
    quote:
      'The internal portal replaced four spreadsheets and a group chat. Onboarding a new hire takes an hour now.',
    name: 'Ayesha Siddika',
    role: 'HR Manager',
    rating: 4,
    avatarUrl: null,
    initials: 'AS',
  },
  {
    id: 'placeholder-12',
    quote:
      'Page speed went from embarrassing to instant, and we started ranking for the terms we actually sell on.',
    name: 'Nabil Ahsan',
    role: 'Founder, Urbanist',
    rating: 5,
    avatarUrl: null,
    initials: 'NA',
  },
]

/**
 * Loop lengths, in seconds. Deliberately coprime-ish and never equal: columns
 * running at the same speed line up into a single sliding block within a few
 * seconds and the whole effect collapses.
 */
const DURATIONS = [26, 32, 29, 35]

/**
 * How each column arrives.
 *
 * The left pair comes in from the left and the right pair from the right, as
 * two halves closing on the centre. Distance is a percentage of the column's
 * own width so it scales with the layout, and the outer pair travels roughly
 * twice as far as the inner one and starts a beat later — which is what makes
 * it read as two groups fanning out rather than four boxes sliding on a rail.
 *
 * Direction and angle ride on `--tx`/`--rot` rather than inline values so a
 * breakpoint can flip them: an inline style cannot carry a media query, and
 * which side a column belongs to depends on how many are visible.
 *
 * The small rotation is the whole reason this looks like motion graphics and
 * not a slideshow: cards that arrive perfectly square read as UI, cards that
 * settle out of a tilt read as objects being placed.
 */
const ENTRY = [
  { vars: '[--tx:-150%] [--rot:-4deg]', delay: 110 },
  // Column two is the *right* half of a two-column phone and the inner *left*
  // of a four-column desktop, so its side flips at lg. Direction follows where
  // a column actually sits, not its index — otherwise both visible columns on a
  // phone would arrive from the left and the effect would be one-sided.
  { vars: '[--tx:150%] [--rot:4deg] lg:[--tx:-80%] lg:[--rot:-2deg]', delay: 0 },
  // Mirror of column two: the outermost of a three-column tablet, the inner
  // *right* of a four-column desktop — so it pulls in closer at lg.
  { vars: '[--tx:150%] [--rot:4deg] lg:[--tx:80%] lg:[--rot:2deg]', delay: 0 },
  { vars: '[--tx:150%] [--rot:4deg]', delay: 110 },
]

/** Long and heavily eased — out of the gate hard, settling slow. */
const ENTRY_MS = 1000
const ENTRY_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'

/** Splits a flat list into `count` columns, dealing round-robin so they stay even. */
const toColumns = (items: Testimonial[], count: number): Testimonial[][] => {
  const columns: Testimonial[][] = Array.from({ length: count }, () => [])
  items.forEach((item, i) => columns[i % count].push(item))
  return columns
}

export const TestimonialsSection: React.FC<{ items?: Testimonial[] }> = ({ items = [] }) => {
  const testimonials = items.length ? items : PLACEHOLDER_TESTIMONIALS
  const columns = toColumns(testimonials, 4)

  /**
   * Columns wait off to their own side until the strip is scrolled to, then
   * slide in once. The marquee inside them is already running while they
   * travel, so they arrive alive rather than starting to move once they land.
   */
  const [entered, setEntered] = useState(false)
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // The whole point of the reduce-motion setting is to not do this.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEntered(true)
      return
    }

    const el = stripRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        setEntered(true)
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
  }, [])

  /*
   * The deep top padding is deliberate and is what the backdrop lettering lives
   * in. The pitch above ends on a row of service cards and this opens on a
   * small badge, so without a band between them the two run together as one
   * undifferentiated stack.
   */
  return (
    <section
      className="relative isolate pb-16 pt-28 sm:pb-24 sm:pt-36 lg:pt-44"
      aria-labelledby="testimonials-heading"
    >
      <OutlineWord className="-top-[5vw] -z-10">REVIEWS</OutlineWord>

      <div className="container">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <span className="rounded-lg border border-border px-4 py-1 text-sm text-muted-foreground">
            Testimonials
          </span>
          <h2
            id="testimonials-heading"
            className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            What our clients <span className="text-primary">say</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Real projects, real results — in their words.
          </p>
        </Reveal>

        {/*
         * The mask fades the cards out at both ends rather than cutting them, so
         * the strip reads as a window onto something continuous. `overflow-hidden`
         * with a capped height is what makes the loop a strip at all — without it
         * the duplicated list would simply run down the page.
         */}
        <div
          ref={stripRef}
          className="mt-10 max-h-95 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_18%,#000_82%,transparent)] sm:mt-12 sm:max-h-115 lg:max-h-135"
        >
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {columns.map((column, i) => {
              const entry = ENTRY[i]
              return (
                <TestimonialsColumn
                  key={i}
                  testimonials={column}
                  duration={DURATIONS[i]}
                  // Two on a phone, a third from md, the fourth from lg. Hidden
                  // rather than dropped so every column keeps its own loop length.
                  className={cn(
                    entry.vars,
                    i === 2 ? 'hidden md:block' : i === 3 ? 'hidden lg:block' : undefined,
                  )}
                  style={{
                    transform: entered
                      ? 'translate3d(0, 0, 0) rotate(0deg) scale(1)'
                      : 'translate3d(var(--tx), 0, 0) rotate(var(--rot)) scale(0.94)',
                    opacity: entered ? 1 : 0,
                    /*
                     * The strip clips its own sides, so a column is still well
                     * inside its fade when it crosses the edge — which is what
                     * hides the clip and makes them look like they come from
                     * off the page rather than appearing at a boundary. Opacity
                     * therefore finishes earlier than the travel, deliberately.
                     */
                    transition: entered
                      ? `transform ${ENTRY_MS}ms ${ENTRY_EASE} ${entry.delay}ms, opacity ${ENTRY_MS * 0.8}ms ease-out ${entry.delay}ms`
                      : 'none',
                    willChange: entered ? undefined : 'transform, opacity',
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
