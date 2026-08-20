'use client'

import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import clsx from 'clsx'
import siteConfig, { type NavChild } from '@/config/site'
import { useAccent } from '@/providers/Accent'

/**
 * Desktop nav. Dropdowns open on **click**, not hover, and the open trigger
 * shares its background with the panel below it — so the panel reads as an
 * extension of the menu item rather than a card floating near it. The panel is
 * borderless — the seam is made by squaring the two corners where they meet, and
 * a concave fillet rounds the inside corner on the open side.
 *
 * The menu deliberately stops at level two. Third-level pages exist and are in
 * the sitemap, but they surface as cards on their parent's page (SubServiceGrid)
 * rather than as menu entries — so the menu stays scannable while every page
 * stays crawlable.
 */

/** Home / About / Contact live in the hamburger drawer only — see site config. */
const inlineNav = siteConfig.nav.filter((item) => !item.drawerOnly)

// ─── Nav label ───────────────────────────────────────────────────────────────

/**
 * A menu item's word, and the hairline under it.
 *
 * The rule is one element that scales rather than a width or an opacity that
 * animates: `scaleX` runs on the compositor, and growing from the centre reads
 * as the line being drawn under the word instead of sliding in from one side.
 *
 * Three states, one element. Open has no line at all — the filled surface under
 * an open trigger is already saying which one it is, and a second marker under
 * it is noise. Active holds the line permanently. Everything else draws it on
 * hover and lets it retract.
 */
const NavLabel: React.FC<{
  label: string
  active: boolean
  /** The accent bar's colour class. */
  bar: string
  open?: boolean
}> = ({ label, active, bar, open = false }) => (
  <span className="relative text-[13px] font-semibold uppercase leading-tight tracking-[0.09em]">
    {label}
    <span
      aria-hidden="true"
      className={clsx(
        // Caps carry a trailing letter-space that the word itself does not, so
        // a full-width bar overhangs the last letter by exactly that much.
        //
        // `transition-[scale]`, not `transition-transform`: Tailwind v4's
        // `scale-*` utilities set the standalone `scale` property rather than
        // composing a `transform`, and `transition-property: transform` does
        // not cover it — the bar snapped between states instead of growing.
        'absolute -bottom-1.5 left-0 h-px w-[calc(100%-0.09em)] origin-center rounded-full transition-[scale] duration-300 ease-out',
        bar,
        open ? 'scale-x-0' : active ? 'scale-x-100' : 'scale-x-0 group-hover/nav:scale-x-100',
      )}
    />
  </span>
)

// ─── One service row inside a dropdown ───────────────────────────────────────

const DropdownRow: React.FC<{ child: NavChild; active: boolean; onNavigate: () => void }> = ({
  child,
  active,
  onNavigate,
}) => {
  const Icon = child.icon
  const { tokens } = useAccent()

  return (
    <div
      className={clsx(
        'rounded-xl transition-colors duration-200',
        active ? 'bg-(--menu-surface-hover)' : 'hover:bg-(--menu-surface-hover)',
      )}
    >
      <Link
        href={child.href}
        onClick={onNavigate}
        className="group flex items-start gap-3 px-2.5 py-2.5"
      >
        <span
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted"
          aria-hidden="true"
        >
          {Icon ? (
            <Icon
              className={clsx(
                'h-4 w-4',
                active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground',
              )}
            />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          {child.logoLight ? (
            <>
              <Image
                src={child.logoLight}
                alt={child.label}
                width={130}
                height={40}
                className="h-8 w-auto object-contain dark:hidden"
              />
              <Image
                src={child.logoDark ?? child.logoLight}
                alt={child.label}
                width={130}
                height={40}
                className="hidden h-8 w-auto object-contain dark:block"
              />
            </>
          ) : (
            <span
              className={clsx(
                'flex items-center gap-1.5 text-sm font-semibold transition-colors',
                active ? tokens.accent : clsx('text-foreground', tokens.accentGroupHover),
              )}
            >
              {child.label}
              <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
            </span>
          )}

          {child.description && (
            <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
              {child.description}
            </span>
          )}
        </span>
      </Link>
    </div>
  )
}

// ─── Header nav ──────────────────────────────────────────────────────────────

export const HeaderNav: React.FC = () => {
  const pathname = usePathname()
  /*
   * The active item wears the same colour as the buttons beside it and the
   * wash behind it, rather than a fixed `primary` — so on a service page the
   * whole header reads as one colour instead of navy sitting on teal.
   */
  const { tokens } = useAccent()
  const [openHref, setOpenHref] = useState<string | null>(null)
  const navRef = useRef<HTMLElement | null>(null)
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const idBase = useId()

  const close = useCallback(() => setOpenHref(null), [])

  // Navigating away closes whatever was open.
  useEffect(() => {
    setOpenHref(null)
  }, [pathname])

  // A click anywhere outside the nav, or Escape, dismisses the panel.
  useEffect(() => {
    if (!openHref) return

    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenHref(null)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      triggerRefs.current[openHref]?.focus()
      setOpenHref(null)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openHref])

  return (
    <nav ref={navRef} className="flex items-center gap-0.5">
      {inlineNav.map((item, index) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        const children = item.children ?? []

        if (!children.length) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                // Colour shift only on hover — no fill. The filled surface is
                // reserved for the open state, where it is the panel's roof.
                'group/nav flex items-center rounded-xl px-4 py-2 transition-colors duration-200',
                tokens.accentHover,
                isActive ? tokens.accent : 'text-foreground/75',
              )}
            >
              <NavLabel label={item.shortLabel ?? item.label} active={isActive} bar={tokens.dot} />
            </Link>
          )
        }

        const isOpen = openHref === item.href
        const panelId = `${idBase}-panel-${index}`
        const triggerId = `${idBase}-trigger-${index}`
        // Items past the midpoint hang from their right edge so wide panels
        // stay inside the viewport.
        const alignEnd = index >= inlineNav.length / 2

        return (
          <div key={item.href} className={clsx('relative', isOpen && 'z-50')}>
            <button
              type="button"
              id={triggerId}
              ref={(el) => {
                triggerRefs.current[item.href] = el
              }}
              aria-haspopup="true"
              aria-expanded={isOpen}
              aria-controls={isOpen ? panelId : undefined}
              onClick={() => setOpenHref(isOpen ? null : item.href)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setOpenHref(item.href)
                }
              }}
              // No transitions anywhere on the trigger: the fill and the panel
              // must land on the same frame, so the menu reads as instant.
              className={clsx(
                'group/nav flex items-center px-4',
                isOpen
                  ? // Open: square off the bottom and run the glass to the very
                    // edge, so it meets the panel below with no seam.
                    'rounded-t-xl bg-(--menu-surface) py-3 text-foreground backdrop-blur-xl'
                  : clsx(
                      // Closed: no fill at all, just a colour shift. The margin
                      // still matches the open state's extra padding so the row
                      // height never changes between the two.
                      'my-1.5 rounded-xl py-1.5',
                      tokens.accentHover,
                      isActive ? tokens.accent : 'text-foreground/75',
                    ),
              )}
            >
              {/*
               * The label alone. The chevron and the category overline above it
               * are gone: four items each carrying a caption and an arrow is a
               * lot of furniture for four words, and the panel opening on click
               * is its own affordance. Inherits the trigger's colour, so it
               * still tracks hover, active and open.
               */}
              <NavLabel
                label={item.shortLabel ?? item.label}
                active={isActive}
                open={isOpen}
                bar={tokens.dot}
              />
            </button>

            {isOpen && (
              <>
                {/* Concave fillet: rounds the inside corner where the trigger's
                    edge meets the panel's top edge. A transparent box whose own
                    rounded corner is a quarter-disc, with the surface colour
                    painted *outside* it by a spread-only shadow and clipped to
                    the corner — so it curves without ever repainting the header
                    behind it. */}
                <span
                  aria-hidden="true"
                  className={clsx(
                    'pointer-events-none absolute bottom-0 h-3 w-3 overflow-hidden',
                    alignEnd ? 'right-full' : 'left-full',
                  )}
                >
                  <span
                    className={clsx(
                      'block h-3 w-3 shadow-[0_0_0_12px_var(--menu-surface)]',
                      alignEnd ? 'rounded-br-[12px]' : 'rounded-bl-[12px]',
                    )}
                  />
                </span>

                <div
                  id={panelId}
                  aria-labelledby={triggerId}
                  className={clsx(
                    // Borderless: the shared surface plus a layered shadow carries
                    // the edge, so nothing outlines the join with the trigger.
                    'absolute top-full w-92 overflow-hidden rounded-b-xl bg-(--menu-surface) backdrop-blur-xl shadow-[0_2px_4px_-1px_rgba(0,0,0,0.06),0_12px_28px_-8px_rgba(0,0,0,0.16),0_28px_60px_-24px_rgba(0,0,0,0.35)]',
                    alignEnd ? 'right-0 rounded-tl-xl' : 'left-0 rounded-tr-xl',
                  )}
                >
                  {/* Section header doubles as the "everything in here" link. */}
                  <Link
                    href={item.href}
                    onClick={close}
                    className="group/all flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-(--menu-surface-hover)"
                  >
                    <span className="flex items-center gap-2.5">
                      {item.icon && (
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                          <item.icon
                            className="h-3.5 w-3.5 text-muted-foreground group-hover/all:text-foreground"
                            aria-hidden="true"
                          />
                        </span>
                      )}
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors group-hover/all:text-primary">
                        All {item.label}
                      </span>
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 text-muted-foreground transition-all duration-200 group-hover/all:-translate-y-0.5 group-hover/all:translate-x-0.5 group-hover/all:text-primary"
                      aria-hidden="true"
                    />
                  </Link>

                  <div className="space-y-0.5 p-2">
                    {children.map((child) => (
                      <DropdownRow
                        key={child.href}
                        child={child}
                        active={pathname === child.href || pathname.startsWith(child.href + '/')}
                        onNavigate={close}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-3 bg-(--menu-surface-hover) px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">Not sure where to start?</span>
                    <Link
                      href="/contact"
                      onClick={close}
                      className="group/cta inline-flex items-center gap-1 text-xs font-semibold text-primary"
                    >
                      Talk to us
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        )
      })}
    </nav>
  )
}
