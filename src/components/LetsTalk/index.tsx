import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { KineticGrid } from '@/components/ui/kinetic-grid'

/**
 * "Let's talk" — the loud one.
 *
 * The only full-bleed dark band on the page and the only place the type is
 * allowed to get this big, which is the point: everything above it is a case
 * being made, and this is the ask. It sits immediately before "Why Choose Us?"
 * so the reasons read as an answer to it rather than as more preamble.
 *
 * Dark in both themes, unlike every other band here. The grid behind it draws
 * light lines on a near-black field — on a white background the whole effect
 * inverts into a grey mesh, and the thing that makes this section feel like a
 * different room disappears with it.
 */
export const LetsTalkSection: React.FC = () => (
  <KineticGrid
    theme="brand"
    className="flex min-h-[32rem] items-center py-24 text-white sm:min-h-[38rem] sm:py-32"
  >
    {/* The grid reacts to the pointer across the whole band, so nothing in here
        may swallow those events — only the two links opt back in. */}
    <div className="pointer-events-none container relative">
      <div className="mx-auto max-w-6xl">
        <span className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
          Have something in mind?
        </span>

        {/*
         * Set in `vw` with a floor and a ceiling rather than at breakpoints:
         * this line is meant to be the largest thing on the site at every
         * width, and stepping it would let a middling screen land somewhere
         * merely large.
         */}
        <h2
          className="mt-6 font-black uppercase leading-[0.86] tracking-[-0.04em]"
          style={{ fontSize: 'clamp(3.5rem, 13vw, 12rem)' }}
        >
          Let&rsquo;s talk
        </h2>

        <p className="mt-8 max-w-xl text-pretty text-base leading-relaxed text-white/60 sm:text-lg">
          Tell us what you are trying to build, or what is not working. We will tell you what it
          takes — no deck, no discovery fee.
        </p>

        <div className="mt-10 flex flex-col items-start gap-x-6 gap-y-3 sm:flex-row sm:items-center">
          <Link
            href="/contact"
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-[background-color,box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-xl hover:shadow-black/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Start a project
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          <Link
            href="/pricing"
            className="group pointer-events-auto inline-flex min-h-11 items-center gap-1.5 px-2 py-3 text-base font-medium text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            See pricing
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </div>
  </KineticGrid>
)
