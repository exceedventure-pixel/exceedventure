'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Reveal } from '@/components/Reveal'
import { DrawnRule } from '@/components/DrawnRule'
import { OutlineWord } from '@/components/OutlineWord'
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
    <section className="relative isolate pb-24 pt-14 sm:pb-32 sm:pt-20 lg:pb-40 lg:pt-24">
      <OutlineWord className="-top-[13vw] -z-10">PROOF</OutlineWord>

      <div className="container">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center sm:mb-20">
          {/* Hairlines rather than a coloured pill: the eyebrow should place the
              section, not compete with six screenshots for attention. */}
          <span className="mb-5 flex items-center justify-center gap-3 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            <span
              aria-hidden="true"
              className="h-px w-8 bg-linear-to-r from-transparent to-border"
            />
            Live, right now
            <span
              aria-hidden="true"
              className="h-px w-8 bg-linear-to-l from-transparent to-border"
            />
          </span>

          {/* Tighter tracking and semibold, matching the hero rather than the
              stock `font-bold` headings — the two screens sit back to back. */}
          <h2 className="text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
            Proof, not a portfolio.
          </h2>

          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            Nothing below is a mockup. Every card is the client&rsquo;s actual website, loaded and
            scrolling itself.
          </p>

          {/* The instruction, given its own line and the page's own colour: it is
              the one sentence here asking for something, and buried at the end of
              a muted paragraph nobody was going to act on it. */}
          <p className="mt-4 text-xl font-medium text-foreground sm:text-2xl">
            <DrawnRule className="text-primary">Click one</DrawnRule> and you are on it.
          </p>
        </Reveal>

        {/*
         * Two up on a phone, four across on a desktop. The card scales a fixed
         * 1440px design space to whatever width it is given, so a narrower
         * column costs detail rather than layout — at two up on a phone the
         * screenshots read as thumbnails of real sites, which is the job here;
         * anyone who wants to read one taps through to the site itself.
         *
         * Row gaps run wider than column gaps because each card carries its
         * caption underneath — without the extra, one card's title crowds the
         * next card's frame and the grid loses its rows.
         *
         * The grid element itself is what the tour observes — its children are
         * the cards, in order, so their positions are the indices it deals in.
         */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-y-14"
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
          <p className="text-sm text-muted-foreground">Yours could be the next one on this wall.</p>
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
