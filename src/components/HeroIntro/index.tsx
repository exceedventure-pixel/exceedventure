'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowDown,
  ArrowRight,
  Bot,
  Globe,
  Megaphone,
  Palette,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import { SERVICE_COPY, SERVICE_ORDER, type ServiceKey } from '@/config/services'
import { accentMap, type AccentColor } from '@/components/ServiceDetail/colors'
import { useAccent } from '@/providers/Accent'

/**
 * The opening screen — a short motion-graphics loop on one full, quiet viewport.
 *
 * Every frame is split: the message on the left, a tilted image card on the
 * right. Both halves arrive together from the same edge and leave through the
 * opposite one, so a slide reads as one composed shot rather than two elements
 * that happen to change at the same moment.
 *
 * Movement, not fading: every line travels. Lines within a frame move different
 * distances and start a beat apart, and the card throws further and rotates
 * into its resting tilt — which is what stops a frame looking like an ordinary
 * slide transition.
 *
 * Hand-rolled like everything else here. A four-stage machine per frame —
 * prep, in, hold, out — with the motion expressed as transforms so it stays on
 * the compositor.
 */

// ─── Timing ──────────────────────────────────────────────────────────────────

/** Entry is unhurried; exit is quick, so a frame clears fast and never drags. */
const ENTER_MS = 620
const EXIT_MS = 380

/** Per-frame dwell, once it has settled. */
const HOLD_OPENING = 1400
/** Service frames carry a headline plus a full sentence beneath it. */
const HOLD_SERVICE = 1700

/** Out of the gate hard, settling gently — the motion-graphics staple. */
const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)'
/** Its mirror: creeps, then leaves decisively. */
const EASE_IN = 'cubic-bezier(0.7, 0, 0.84, 0)'

// ─── Frames ──────────────────────────────────────────────────────────────────

type Direction = 'up' | 'down' | 'left' | 'right'

type Frame = {
  kicker?: string
  lead: string
  accent?: string
  sub: string
  href?: string
  /** Label for the frame's button. Present whenever `href` is. */
  cta?: string
  /** Which edge this frame flies in from. It leaves through the opposite one. */
  from: Direction
  /**
   * The frame's colour, resolved through `accentMap` for classes. Also what
   * the frame publishes to the header while it is on screen, so the buttons up
   * there wear whatever the slide behind them is wearing.
   */
  color: AccentColor
  /** Resting rotation of the image card, in degrees. Alternates frame to frame. */
  tilt: number
  /** Stands in for the artwork until there is any — see SLIDE_IMAGE. */
  icon: LucideIcon
  image?: string
  hold: number
}

/** Each frame flies in from a different edge, in this order. */
const ENTRY_EDGES: Direction[] = ['left', 'right', 'up', 'down']

/**
 * Slide artwork.
 *
 * Drop a file into `public/assets/hero/` and name it here — the card crops with
 * object-cover, so anything roughly landscape works and nothing else needs to
 * change. A slide without an entry renders a tinted panel carrying the
 * service's icon instead: a deliberate placeholder rather than a hole in the
 * layout, and a visible reminder that the image is still to come.
 */
const SLIDE_IMAGE: Partial<Record<ServiceKey | 'opening', string>> = {
  // opening: '/assets/hero/opening.jpg',
  // 'websites-softwares': '/assets/hero/websites-softwares.jpg',
  // 'digital-marketing': '/assets/hero/digital-marketing.jpg',
  // 'automation-ai': '/assets/hero/automation-ai.jpg',
  // 'creative-branding': '/assets/hero/creative-branding.jpg',
}

const SLIDE_ICON: Record<ServiceKey, LucideIcon> = {
  'websites-softwares': Globe,
  'digital-marketing': Megaphone,
  'automation-ai': Bot,
  'creative-branding': Palette,
}

/**
 * The service slides. Words, colour and link all come from the shared service
 * config, so the loop and the page each frame links to cannot drift apart.
 */
const SERVICES: Frame[] = SERVICE_ORDER.map((key, i) => {
  const copy = SERVICE_COPY[key]
  return {
    kicker: copy.name,
    lead: copy.slide.lead,
    accent: copy.slide.accent,
    sub: copy.slide.sub,
    href: copy.href,
    cta: copy.slide.cta,
    color: copy.color,
    from: ENTRY_EDGES[i],
    tilt: i % 2 === 0 ? -5 : 5,
    icon: SLIDE_ICON[key],
    image: SLIDE_IMAGE[key],
    hold: HOLD_SERVICE,
  }
})

const OPENING: Frame = {
  lead: 'GET YOUR BUSINESS',
  accent: 'ONLINE',
  sub: 'Everything you need to build, grow & manage your digital presence.',
  href: '/contact',
  cta: 'Start a project',
  from: 'up',
  color: 'brand',
  tilt: -6,
  icon: Sparkles,
  image: SLIDE_IMAGE.opening,
  hold: HOLD_OPENING,
}

const FRAMES: Frame[] = [OPENING, ...SERVICES]

/**
 * Travel per direction. Generous, and in viewport units so the gesture scales
 * with the screen instead of looking timid on a large monitor.
 *
 * Every value carries a unit, `0px` included: these go through `calc()` to be
 * scaled per line, and `calc(0 * 1)` resolves to a bare number rather than a
 * length, which invalidates the whole `translate3d` and silently kills the
 * animation.
 */
const TRAVEL: Record<Direction, { from: string; to: string }> = {
  left: { from: '-16vw, 0px', to: '16vw, 0px' },
  right: { from: '16vw, 0px', to: '-16vw, 0px' },
  up: { from: '0px, 5.5rem', to: '0px, -5.5rem' },
  down: { from: '0px, -5.5rem', to: '0px, 5.5rem' },
}

/** The card sits at a slight angle to the viewer, turned towards the words. */
const CARD_YAW = -6
/** Extra roll it carries in and sheds on the way out. */
const CARD_SPIN = 9
/** It throws further than the text, which is what separates the two planes. */
const CARD_DEPTH = 1.35

/** Scales one leg of a TRAVEL pair. Kept as calc() so the units survive. */
const scaleOffset = (offset: string, depth: number) =>
  offset
    .split(',')
    .map((v) => `calc(${v.trim()} * ${depth})`)
    .join(', ')

type Stage = 'prep' | 'in' | 'hold' | 'out'

export const HeroIntro: React.FC = () => {
  const [index, setIndex] = useState(0)
  const [stage, setStage] = useState<Stage>('prep')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [paused, setPaused] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  /**
   * Reduced motion parks the loop on the opening promise. Letting the cycle run
   * would be worse than useless: the global rule crushes every duration to
   * 0.01ms, turning the whole thing into a strobe of hard cuts.
   */
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  // Idle while off screen or in a background tab, as the carousel does.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => setPaused(!entry.isIntersecting), {
      threshold: 0.2,
    })
    observer.observe(el)

    const onVisibility = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  // The loop.
  useEffect(() => {
    if (reducedMotion || paused) return

    if (stage === 'prep') {
      /*
       * Two frames, not one. The element has just been given its off-screen
       * transform with transitions disabled; the browser has to actually paint
       * that before the transition to zero can animate from it. A single rAF
       * lands in the same frame often enough to make the entry jump.
       */
      let inner = 0
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setStage('in'))
      })
      return () => {
        cancelAnimationFrame(outer)
        cancelAnimationFrame(inner)
      }
    }

    const next: Record<Exclude<Stage, 'prep'>, [number, () => void]> = {
      in: [ENTER_MS, () => setStage('hold')],
      hold: [FRAMES[index].hold, () => setStage('out')],
      out: [
        EXIT_MS,
        () => {
          setIndex((i) => (i + 1) % FRAMES.length)
          setStage('prep')
        },
      ],
    }

    const [delay, run] = next[stage]
    const timer = setTimeout(run, delay)
    return () => clearTimeout(timer)
  }, [stage, index, reducedMotion, paused])

  // Reduced motion parks on the opening promise rather than cycling.
  const frame = reducedMotion ? FRAMES[0] : FRAMES[index]
  const travel = TRAVEL[frame.from]
  const tokens = accentMap[frame.color]

  /**
   * Hand the current slide's colour to the header, so its buttons change with
   * the wash behind them. Handed back on the way out — including when the loop
   * simply scrolls off screen, which is what stops the rest of the page being
   * left in whichever colour happened to be showing at the time.
   */
  const { setAccent } = useAccent()
  useEffect(() => {
    if (paused) return
    setAccent(frame.color)
    return () => setAccent('brand')
  }, [frame.color, paused, setAccent])

  /** Where the frame stands right now — off-screen, or null once settled. */
  const offset = stage === 'prep' ? travel.from : stage === 'out' ? travel.to : null

  /**
   * One line's motion.
   *
   * `depth` scales how far it travels and `delay` staggers its start, so the
   * lines of a frame arrive as a group rather than as a single sliding block.
   */
  const move = (depth: number, delay: number): React.CSSProperties => {
    if (reducedMotion) return {}

    const settled = offset === null

    return {
      transform: settled ? 'translate3d(0, 0, 0)' : `translate3d(${scaleOffset(offset, depth)}, 0)`,
      opacity: settled ? 1 : 0,
      transition:
        stage === 'prep'
          ? 'none'
          : `transform ${stage === 'out' ? EXIT_MS : ENTER_MS}ms ${
              stage === 'out' ? EASE_IN : EASE_OUT
            } ${stage === 'out' ? 0 : delay}ms, opacity ${
              stage === 'out' ? EXIT_MS : ENTER_MS
            }ms linear ${stage === 'out' ? 0 : delay}ms`,
      willChange: 'transform, opacity',
    }
  }

  /**
   * The card's arrival: the same clock as the lines, a longer throw, and a roll
   * it sheds as it lands — so it reads as a card being placed rather than a
   * picture sliding in. The yaw is constant and never animates; only the roll
   * and the scale do.
   */
  const moveCard = (): React.CSSProperties => {
    const rest = `rotateY(${CARD_YAW}deg) rotate(${frame.tilt}deg)`
    if (reducedMotion) return { transform: rest }

    if (offset === null) {
      return {
        transform: `translate3d(0, 0, 0) ${rest} scale(1)`,
        opacity: 1,
        transition: `transform ${ENTER_MS}ms ${EASE_OUT} 110ms, opacity ${ENTER_MS}ms linear 110ms`,
        willChange: 'transform, opacity',
      }
    }

    const spin = stage === 'prep' ? CARD_SPIN : -CARD_SPIN
    return {
      transform: `translate3d(${scaleOffset(offset, CARD_DEPTH)}, 0) rotateY(${CARD_YAW}deg) rotate(${
        frame.tilt + spin
      }deg) scale(0.9)`,
      opacity: 0,
      transition:
        stage === 'prep'
          ? 'none'
          : `transform ${EXIT_MS}ms ${EASE_IN}, opacity ${EXIT_MS}ms linear`,
      willChange: 'transform, opacity',
    }
  }

  const Icon = frame.icon

  const headline = (
    <>
      <span
        className="block h-5 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground"
        style={move(0.55, 0)}
      >
        {frame.kicker ?? ''}
      </span>

      {/* clamp() rather than breakpoint steps, so the line grows continuously
          and lands at the same optical weight on any screen. The opening frame
          gets the larger cap — it is the shortest line and the one that has to
          carry the whole screen on its own.

          Tracking is near-neutral rather than the tight -0.03em these lines used
          to run at: they are set in caps now, and caps at negative tracking
          close up into a single block. */}
      <span
        className="mt-3 block text-balance font-semibold tracking-[-0.01em]"
        style={{
          ...move(1, 70),
          fontSize: frame.kicker ? 'clamp(1.75rem, 3.2vw, 3.15rem)' : 'clamp(2rem, 3.8vw, 3.85rem)',
          lineHeight: 1.08,
        }}
      >
        {frame.lead}
        {frame.accent && (
          <>
            {' '}
            <span className={tokens.accent}>{frame.accent}</span>
          </>
        )}
      </span>

      <span
        className="mx-auto mt-4 block max-w-xl text-balance text-base text-muted-foreground sm:text-lg lg:mx-0"
        style={move(0.75, 140)}
      >
        {frame.sub}
      </span>
    </>
  )

  /**
   * The frame's button, filled with the frame's own colour.
   *
   * The one thing on this screen that is not decorative, so it sits outside the
   * `aria-hidden` blocks and stays focusable: a button a keyboard cannot reach
   * and a screen reader cannot see is not a call to action. It carries no
   * `aria-live`, so changing slides never interrupts anyone — it simply reads
   * as whatever it currently says.
   */
  const button = frame.href && frame.cta && (
    <Link
      href={frame.href}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-medium shadow-lg transition-[background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2',
        tokens.cta,
        tokens.ctaText,
      )}
      style={move(0.85, 210)}
    >
      {frame.cta}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  )

  /**
   * The right half. The glow behind the card is deliberately left still while
   * the card moves — it belongs to the section's ambient light, not the frame.
   */
  /*
   * The card is width-capped rather than left to fill its column: the yaw and
   * roll push its painted corners a good 20px outside its box, and at full
   * column width the low corner crosses the container's right edge and stops
   * lining up with the header above it.
   */
  const card = (
    <div className="relative mx-auto w-full max-w-68 [perspective:1400px] sm:max-w-xs lg:max-w-xl">
      {/* The wash behind the card. Not a halo around it — a single soft orb
          hung off the right edge and mostly outside the card, so the colour
          arrives from that side and falls away to nothing across the words.
          Same construction as the section's own light: one blurred circle in
          the frame's colour, crossfading on the same slow clock. */}
      <div
        className={cn(
          'pointer-events-none absolute -right-[22%] top-1/2 -z-10 h-[145%] w-[95%] -translate-y-1/2 rounded-full opacity-90 blur-[80px] transition-colors duration-1000',
          tokens.glow,
        )}
      />
      <div
        className="relative aspect-4/3 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-2xl shadow-black/20 dark:shadow-black/50"
        style={moveCard()}
      >
        {frame.image ? (
          <Image
            src={frame.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 32rem, 80vw"
            className="object-cover"
            priority
          />
        ) : (
          /* Placeholder until the artwork lands. Tinted to the frame so it still
             changes with the slide rather than reading as a broken image. */
          <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 bg-background">
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:2.25rem_2.25rem]" />
            <Icon className={cn('relative h-10 w-10 sm:h-14 sm:w-14', tokens.accent)} />
            <span className="relative px-6 text-center text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground sm:text-xs">
              {frame.kicker ?? 'Exceed Venture'}
            </span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <section
      ref={sectionRef}
      aria-label="Introduction"
      // The header watches for this and goes transparent while this screen is
      // behind it, solid from the next section on. A page without this marker
      // keeps the ordinary solid header.
      data-header-transparent=""
      /*
       * Pulled up under the header by exactly its height, then padded back down
       * by the same amount. The section's background therefore starts at the top
       * of the window with the (transparent) header floating on it, while the
       * content stays optically centred in the space below the header rather
       * than in the whole viewport. Full svh, since it owns the header's strip
       * too.
       *
       * The foot padding only has to clear the absolutely positioned scroll cue
       * now: the progress rail moved into the flow under the words, so it no
       * longer needs reserving for here.
       */
      className="relative -mt-[var(--header-h)] flex min-h-svh flex-col justify-center overflow-hidden pb-20 pt-[var(--header-h)] sm:pb-24"
    >
      {/* Ambient light, tinted to whichever service is on screen. It crossfades
          on its own slow clock so the colour shift trails the words slightly —
          the tint feels like a consequence of the frame, not part of it.

          Masked to nothing before the bottom edge. The section clips its
          overflow, so without this the glow ends on a hard horizontal line
          exactly where the next section starts, which is far more noticeable
          than the glow itself. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,#000_0%,#000_58%,transparent_100%)]"
        aria-hidden="true"
      >
        <div
          className={cn(
            'hero-intro-glow absolute left-1/2 top-1/3 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] transition-colors duration-1000',
            tokens.glow,
          )}
        />
        <div className="hero-intro-glow hero-intro-glow--slow absolute left-[62%] top-[62%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 blur-[120px] dark:bg-secondary/15" />
      </div>

      {/* One static heading for assistive tech and crawlers. The animated block
          is decorative — announcing a new phrase every second would make the
          page unusable with a screen reader. */}
      <h2 className="sr-only">
        Get your business online — everything you need to build, grow and manage your digital
        presence: websites and software, digital marketing, automation and AI, creative and
        branding.
      </h2>

      {/* `aria-hidden` sits on the two decorative halves rather than the whole
          grid, so the button between them stays a real, reachable link. */}
      <div className="container">
        {/* No max-width of its own: the bare container is what the header uses,
            so the words start on the same line as the logo and the card ends on
            the same line as the header's buttons. */}
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* Words. Centred while the halves are stacked, left-aligned the
              moment they sit side by side.

              Ordered second while stacked so the card leads on a phone and the
              progress rail ends up under everything rather than wedged between
              the two halves. */}
          <div className="order-2 text-center lg:order-1 lg:text-left">
            {/* Fixed min-height so the card beside it holds still as frames swap
                between one-, two- and three-line headlines. */}
            <div
              className="flex min-h-48 flex-col justify-center sm:min-h-56 lg:min-h-64"
              aria-hidden="true"
            >
              {frame.href ? (
                <Link href={frame.href} tabIndex={-1} className="block">
                  {headline}
                </Link>
              ) : (
                headline
              )}
            </div>

            {button && <div className="mt-7">{button}</div>}

            {/* Progress: one hairline per frame, filling over that frame's own
                length. In the flow under the words so it tracks their edge. */}
            {!reducedMotion && (
              <div className="mt-8 flex justify-center gap-2 lg:justify-start" aria-hidden="true">
                {FRAMES.map((f, i) => (
                  <button
                    key={`${f.lead}-${i}`}
                    type="button"
                    tabIndex={-1}
                    onClick={() => {
                      setIndex(i)
                      setStage('prep')
                    }}
                    className="h-0.5 w-8 overflow-hidden rounded-full bg-foreground/15 transition-colors hover:bg-foreground/30"
                  >
                    <span
                      className={cn(
                        'block h-full rounded-full bg-foreground/60',
                        i === index && stage !== 'prep' ? 'hero-intro-fill' : 'w-0',
                      )}
                      style={
                        i === index
                          ? ({
                              animationDuration: `${ENTER_MS + f.hold + EXIT_MS}ms`,
                            } as React.CSSProperties)
                          : undefined
                      }
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="order-1 lg:order-2" aria-hidden="true">
            {frame.href ? (
              <Link href={frame.href} tabIndex={-1} className="block">
                {card}
              </Link>
            ) : (
              card
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <span className="flex flex-col items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Scroll
          <ArrowDown className="hero-intro-nudge h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </section>
  )
}
