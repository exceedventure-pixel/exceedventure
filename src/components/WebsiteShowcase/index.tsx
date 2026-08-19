'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Reveal } from '@/components/Reveal'
import { ShowcaseCard } from './ShowcaseCard'
import { useAutoTour } from './useAutoTour'
import type { ShowcaseItem } from './types'

/**
 * The website showcase — real client sites, running live, under the homepage
 * hero.
 *
 * Three equal columns, not the bento it started as. Mixed spans meant every
 * card framed its site at a different width and scale, so the same 1440px page
 * arrived legible in one card and unreadable in the next; uniform cards make
 * the sites comparable, which is the only thing this section is for.
 *
 * The layout is deliberately airier than the boilerplate sections around it.
 * Six screenshots are six busy images — packed tight, with each title burned
 * into a dark gradient over the artwork, they read as a contact sheet. Space
 * between them, and captions set *below* the frame rather than on top of it, is
 * what turns the same six images into a portfolio. Nothing overlaps the work.
 *
 * Renders nothing at all when there is nothing published: no heading, no
 * padding, no empty band. The hero simply flows into the stats section the way
 * it did before this existed. A "coming soon" placeholder here would be worse
 * than absence — /our-works already carries that message.
 */
export const WebsiteShowcaseSection: React.FC<{ items: ShowcaseItem[] }> = ({ items }) => {
  const { gridRef, autoDelayFor, onCardHover } = useAutoTour(items.length)

  if (!items.length) return null

  return (
    <section className="py-24 sm:py-32 lg:py-40">
      <div className="container">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center sm:mb-20">
          {/* Hairlines rather than a coloured pill: the eyebrow should place the
              section, not compete with six screenshots for attention. */}
          <span className="mb-5 flex items-center justify-center gap-3 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            <span aria-hidden="true" className="h-px w-8 bg-linear-to-r from-transparent to-border" />
            Selected work
            <span aria-hidden="true" className="h-px w-8 bg-linear-to-l from-transparent to-border" />
          </span>

          {/* Tighter tracking and semibold, matching the hero rather than the
              stock `font-bold` headings — the two screens sit back to back. */}
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Websites we&rsquo;ve built
          </h2>

          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            Not screenshots on a slide — these are the real sites, running live. They browse
            themselves; click any one to visit it.
          </p>
        </Reveal>

        {/*
         * One column on phones: a whole website scaled into half a phone screen
         * is unreadable, and an unreadable card proves nothing.
         *
         * Row gaps run wider than column gaps because each card now carries its
         * caption underneath — without the extra, one card's title crowds the
         * next card's frame and the grid loses its rows.
         *
         * The grid element itself is what the tour observes — its children are
         * the cards, in order, so their positions are the indices it deals in.
         */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3 lg:gap-y-14"
        >
          {items.map((item, i) => (
            <Reveal
              key={item.id}
              // Capped: the eighth card should not wait two thirds of a second.
              delay={Math.min(i * 80, 400)}
            >
              <ShowcaseCard
                item={item}
                autoDelay={autoDelayFor(i)}
                onHoverChange={(isHovered) => onCardHover(i, isHovered)}
              />
            </Reveal>
          ))}
        </div>

        {/*
         * Points at /contact, not /our-works: that page is still the "portfolio
         * coming soon" placeholder, and sending someone from six live sites to
         * an empty page is worse than not offering the link.
         */}
        <Reveal delay={160} className="mt-14 text-center sm:mt-20">
          <p className="text-sm text-muted-foreground">
            Yours could be the next one on this wall.
          </p>
          <Link
            href="/contact"
            className="group mt-5 inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            Start a project
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
