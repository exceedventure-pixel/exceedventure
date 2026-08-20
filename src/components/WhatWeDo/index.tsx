import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin, Monitor, Pencil, Settings, Target, type LucideIcon } from 'lucide-react'

import { Reveal } from '@/components/Reveal'
import { cn } from '@/utilities/ui'

/**
 * "What we do best" — a bento grid of six capabilities.
 *
 * Every colour is a token or a token-derived tint rather than a fixed value,
 * so one set of classes covers both themes. The card fill is an alpha tint of
 * `foreground`: it darkens a light background slightly and lightens a dark one,
 * which is the same "one step off the background" relationship either way.
 *
 * Two things make it a bento rather than six boxes, and both are load-bearing:
 *
 *   1. The cells are near-square and the grid is two rows of four, edge to
 *      edge. The ratio is what holds the shape: left to size itself the rows
 *      went shallow and wide, which is what a table looks like.
 *   2. The art is absolutely positioned and oversized, hanging off the card's
 *      edges rather than sitting in a slot beside the words. A 3D render cropped
 *      by its own card reads as an object behind the text; the same render
 *      shrunk to fit reads as an icon.
 */

/**
 * Art lives in `public/assets/services/` and is named here exactly as it sits
 * on disk, capital letter included — the dev server is case-insensitive on
 * Windows and a Linux deploy target is not, so a lowercased name works locally
 * and 404s in production.
 *
 * `art: null` falls back to the card's lucide glyph. Set it only when the file
 * is genuinely absent: next/image returns 400 for a path that does not resolve,
 * which renders as a broken card rather than a placeholder.
 *
 * Transparent PNGs, square, 500×500 or larger.
 */
const ICON_DIR = '/assets/services'

/**
 * One render on a card.
 *
 * `className` carries both position and size, as a share of the card:
 * percentages over fixed sizes so one set of numbers holds from the square's
 * smallest width to its largest, and negative insets so a render can overhang
 * the edge rather than sitting in a slot.
 */
type Art = {
  file: string
  className: string
  /**
   * Skips the hover lift for this render. The target sits nearly flush to its
   * card's top and bottom, so even a 2px rise pushes it into the overflow clip
   * and reads as a twitch rather than a lift.
   */
  still?: boolean
}

type Item = {
  title: string
  body: string
  href: string
  /** One render, or several — the websites card pairs a desktop with a phone. */
  art: Art[]
  /** Stand-in when a card has no art at all. */
  glyph: LucideIcon
  /** Grid placement. Literal classes — Tailwind never sees an interpolation. */
  span: string
  /** Which end of the card the words are anchored to. */
  textClass: string
}

const ITEMS: Item[] = [
  {
    title: 'Websites & Software',
    body: 'Sites and systems built to load fast, rank, and be edited by your own team.',
    href: '/websites-softwares',
    art: [
      { file: 'Computer.png', className: 'left-[2%] top-[6%] h-[30%] w-[62%]' },
      // Overlaps the monitor's lower right, the way the two actually sit on a
      // desk — side by side at matching sizes reads as two unrelated icons.
      { file: 'Mobile.png', className: 'right-[2%] top-[18%] h-[24%] w-[38%]' },
    ],
    glyph: Monitor,
    // The tall one. Its two-row height is what gives the grid its rhythm.
    span: 'row-span-2',
    textClass: 'mt-auto',
  },
  {
    title: 'Digital Marketing',
    body: 'Campaigns you can trace to a sale. Ads, social and content, reported on one page you actually read.',
    href: '/digital-marketing',
    art: [
      {
        file: 'Target.png',
        className:
          '-bottom-[8%] -right-[6%] h-[42%] w-[42%] md:bottom-auto md:right-[1%] md:top-1/2 md:h-[96%] md:w-[42%] md:-translate-y-1/2',
        still: true,
      },
    ],
    glyph: Target,
    span: 'md:col-span-2',
    textClass: '',
  },
  {
    title: 'Creative & Branding',
    body: 'Identity, graphics and content that make you look like one company — and a serious one.',
    href: '/creative-branding',
    // A single cell now rather than a wide one, so the pencil sits in a corner
    // like the other squares instead of running down the middle of the card.
    art: [
      {
        file: 'Pencil.png',
        className: '-right-[6%] -top-[6%] h-[44%] w-[44%] md:-top-[8%] md:h-[62%] md:w-[62%]',
      },
    ],
    glyph: Pencil,
    span: '',
    textClass: 'mt-auto',
  },
  {
    title: 'SEO & Local Search',
    body: 'Found by the people already looking for you, in the places they are looking.',
    href: '/digital-marketing',
    art: [
      {
        file: 'Mappin.png',
        className:
          '-bottom-[8%] -right-[8%] h-[42%] w-[42%] md:-bottom-[10%] md:h-[62%] md:w-[62%]',
      },
    ],
    glyph: MapPin,
    span: '',
    textClass: '',
  },
  {
    title: 'Automation & AI',
    body: 'The copying, chasing and retyping, handled quietly in the background.',
    href: '/automation-ai',
    art: [
      {
        file: 'Setting.png',
        className: '-right-[6%] -top-[6%] h-[42%] w-[42%] md:-top-[8%] md:h-[58%] md:w-[58%]',
      },
    ],
    glyph: Settings,
    span: '',
    textClass: 'mt-auto',
  },
  {
    title: 'Ongoing Support',
    body: 'We do not vanish at launch. Small things get fixed the same day.',
    href: '/contact',
    art: [
      {
        file: 'Clock.png',
        className:
          '-bottom-[10%] -right-[6%] h-[64%] w-[32%] md:-bottom-[12%] md:-right-[10%] md:h-[64%] md:w-[64%]',
      },
    ],
    glyph: Clock,
    span: 'col-span-2 md:col-span-1',
    textClass: '',
  },
]

/**
 * A card's renders, each positioned and sized on its own.
 *
 * Behind the words, and out of the pointer's way: the card is the link, and a
 * render sitting on top of it would swallow the hover it triggers.
 */
const Artwork: React.FC<{ item: Item }> = ({ item }) => {
  const Glyph = item.glyph

  if (!item.art.length) {
    return (
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <Glyph className="h-1/4 w-1/4 text-muted-foreground/40" strokeWidth={1} />
      </span>
    )
  }

  return (
    <>
      {item.art.map((art) => (
        <span
          key={art.file}
          className={cn(
            'pointer-events-none absolute',
            // `transition-[translate]`, not `transition-transform`: Tailwind v4's
            // `translate-*` utilities set the standalone `translate` property
            // rather than composing a `transform`, and `transition-property:
            // transform` does not cover it — the lift was snapping, not easing.
            !art.still &&
              'transition-[translate] duration-500 ease-out group-hover:-translate-y-0.5',
            art.className,
          )}
        >
          <Image
            src={`${ICON_DIR}/${art.file}`}
            alt=""
            width={500}
            height={500}
            // The largest render is the target's, at roughly 260px across.
            sizes="280px"
            className="h-full w-full select-none object-contain"
            draggable={false}
          />
        </span>
      ))}
    </>
  )
}

const Card: React.FC<{ item: Item; index: number }> = ({ item, index }) => (
  <Reveal delay={Math.min(index * 70, 350)} className={cn('h-full', item.span)}>
    <Link
      href={item.href}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl bg-foreground/[0.04] p-4 ring-1 ring-foreground/[0.07] sm:p-5',
        'transition-[background-color,box-shadow] duration-300 hover:bg-foreground/[0.07] hover:shadow-xl hover:shadow-foreground/5',
        'dark:bg-white/[0.06] dark:ring-white/[0.07] dark:hover:bg-white/[0.1] dark:hover:shadow-2xl dark:hover:shadow-black/40',
      )}
    >
      <Artwork item={item} />

      {/*
       * Capped width so a sentence never runs under the artwork. Two thirds on
       * the wide cards, where the render takes the right-hand half; the full
       * card on the square ones, where it sits in a corner.
       */}
      <span
        className={cn(
          'relative z-10 max-w-[74%] md:max-w-[62%]',
          item.span.includes('col-span-2') && 'md:max-w-[52%]',
          item.textClass,
        )}
      >
        <span className="block text-base font-semibold leading-snug tracking-[-0.01em] text-foreground sm:text-lg">
          {item.title}
        </span>
        <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
          {item.body}
        </span>
      </span>
    </Link>
  </Reveal>
)

/**
 * The bento itself, with no section chrome of its own.
 *
 * It used to be a whole band — dark background, heading, lead paragraph — and
 * now sits inside the homepage's pitch section under that section's heading,
 * so it brings nothing but the grid. The cards were already built from theme
 * tokens rather than the band's own colours, which is why they carry over to
 * an ordinary background unchanged.
 */
export const WhatWeDoGrid: React.FC<{ className?: string }> = ({ className }) => (
  /*
   * Two layouts, one order. Four columns by two rows from `md`; two columns by
   * four rows below that. The spans live on the items and switch at the
   * breakpoint: the tall card is tall in both, the wide card is wide only where
   * there are four columns to be wide across, and Support goes full width on
   * mobile so neither layout ends on a lone square.
   *
   * Auto-placement does the rest, which is why the order of `ITEMS` is
   * load-bearing in both — Creative sits third so it lands in the fourth column
   * on desktop and beside the tall card on mobile, rather than being pushed to
   * a row of its own either way.
   *
   * An aspect ratio rather than a height, so the cells hold their shape at any
   * width instead of needing a breakpoint each. Slightly wider than the 2/1
   * that would make them exactly square: at full width square cells ran over
   * 1100px tall, which is more than one screen and the whole point of a bento
   * is taking it in at a glance.
   *
   * Both layouts get a ratio rather than a height, so a cell keeps its shape
   * at any width without a breakpoint for each step.
   */
  <div
    className={cn(
      'grid w-full grid-cols-2 gap-3 sm:gap-4',
      // Two columns by four rows would be 1:2 with square cells. The copy does
      // not shrink with the cells, so the rows take the extra height they need
      // instead — at 1:2.2 the two longest cards clipped their own text.
      'aspect-[1/2.5] md:aspect-[2.7/1] md:grid-cols-4 md:grid-rows-2',
      className,
    )}
  >
    {ITEMS.map((item, i) => (
      <Card key={item.title} item={item} index={i} />
    ))}
  </div>
)
