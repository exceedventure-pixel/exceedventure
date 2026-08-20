'use client'

import React from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'

import { cn } from '@/utilities/ui'
import type { Testimonial } from '@/components/Testimonials/types'

/**
 * One endlessly scrolling column of review cards.
 *
 * The list is rendered twice and the track travels exactly -50%, so the moment
 * the first copy has gone the second is sitting precisely where it started —
 * the loop has no seam and no reset frame.
 *
 * The upstream component drove this with `motion/react`. It is a single linear
 * translate on a loop, which a CSS keyframe does natively and on the compositor,
 * so it is a keyframe here (`testimonial-marquee`, in globals.css) rather than a
 * new animation dependency in a codebase that hand-rolls the rest of its motion.
 * The behaviour is identical; `duration` still sets the loop length.
 */
export const TestimonialsColumn = ({
  className,
  style,
  testimonials,
  duration = 10,
}: {
  className?: string
  /**
   * Applied to the column's outer box, which the marquee track sits inside.
   * Two transforms on two elements: the section slides this one in on scroll,
   * the track loops within it, and neither has to know about the other.
   */
  style?: React.CSSProperties
  testimonials: Testimonial[]
  duration?: number
}) => {
  if (!testimonials.length) return null

  return (
    <div className={className} style={style}>
      <div
        className="flex animate-[testimonial-marquee_linear_infinite] flex-col gap-4 sm:gap-6"
        style={{ animationDuration: `${duration}s` }}
      >
        {[0, 1].map((copy) => (
          <React.Fragment key={copy}>
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={`${copy}-${testimonial.id}`}
                testimonial={testimonial}
                // Only the first copy is real content; the second exists to make
                // the loop seamless and would read as duplicates out loud.
                aria-hidden={copy === 1}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

const TestimonialCard = ({
  testimonial,
  'aria-hidden': ariaHidden,
}: {
  testimonial: Testimonial
  'aria-hidden'?: boolean
}) => {
  const { quote, name, role, rating, avatarUrl, initials } = testimonial

  return (
    <figure
      aria-hidden={ariaHidden}
      className="w-full rounded-3xl border border-border bg-card p-4 shadow-lg shadow-primary/5 sm:p-7"
    >
      <Stars rating={rating} name={name} />

      <blockquote className="mt-3 text-sm leading-relaxed text-foreground/90 sm:mt-4 sm:text-base">
        {quote}
      </blockquote>

      <figcaption className="mt-4 flex items-center gap-2.5 sm:mt-5 sm:gap-3">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={40}
            height={40}
            className="h-8 w-8 shrink-0 rounded-full object-cover sm:h-10 sm:w-10"
          />
        ) : (
          /* Initials rather than a grey silhouette: most clients never send a
             headshot, and a card with nothing but a quote still looks finished. */
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary sm:h-10 sm:w-10 sm:text-xs dark:bg-secondary/15 dark:text-secondary"
          >
            {initials}
          </span>
        )}

        {/* Wraps rather than truncates: at two columns on a phone these are
            narrow enough that an ellipsis eats half the name, and "Nusrat
            Jah…" is worse than the same name across two lines. */}
        <span className="min-w-0">
          <span className="block text-sm font-medium leading-5 tracking-tight">{name}</span>
          {role && (
            <span className="block text-sm leading-5 tracking-tight text-muted-foreground">
              {role}
            </span>
          )}
        </span>
      </figcaption>
    </figure>
  )
}

/**
 * Five stars, filled to the rating.
 *
 * All five are always drawn — a row that simply gets shorter reads as a shorter
 * row, not as a lower score, and the empty ones are what make four out of five
 * legible at a glance.
 */
const Stars = ({ rating, name }: { rating: number; name: string }) => (
  <div className="flex items-center gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
    <span className="sr-only">{name} rated us </span>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        aria-hidden="true"
        className={cn(
          'h-3.5 w-3.5 sm:h-4 sm:w-4',
          star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-border',
        )}
      />
    ))}
  </div>
)
