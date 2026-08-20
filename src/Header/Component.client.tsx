'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import { cn } from '@/utilities/ui'

import { Logo } from '@/components/Logo/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { HeaderNav } from './Nav'
import { MobileMenu } from './MobileMenu'
import { MegaMenu, MegaMenuButton } from './MegaMenu'
import { AccountButton } from './AccountButton'
import { ContactButton } from './ContactButton'
import type { ContactChannels } from '@/utilities/getSiteSettings'

/**
 * Runs before paint on the client, so the header can start out transparent on a
 * page that wants it rather than showing its solid background for a frame.
 * Falls back to useEffect on the server, where layout effects do not run and
 * React would warn about it.
 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export const HeaderClient: React.FC<{ channels: ContactChannels }> = ({ channels }) => {
  const [heroTheme, setHeroTheme] = useState<string | null>(null)
  /** True while a full-screen hero is the thing sitting behind the header. */
  const [overHero, setOverHero] = useState(false)
  /**
   * Transitions stay off until after the first paint.
   *
   * The server cannot know a page has a transparent hero, so it always sends
   * the solid header and the browser paints that before hydration. With
   * transitions live, correcting it on hydration reads as the header fading out
   * on every load. Off for one frame, the correction is simply the header's
   * first appearance.
   */
  const [animate, setAnimate] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  // Reset hero-override and close the mega menu whenever we navigate
  useEffect(() => {
    setHeaderTheme(null)
    setHeroTheme(null)
    setMegaOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Apply hero-override only when a page explicitly requests it
  useEffect(() => {
    setHeroTheme(headerTheme ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  /**
   * Transparent over a full-screen hero, solid from the next section on.
   *
   * Driven by whether the marked hero still reaches under the header, not by a
   * scroll offset: the threshold is then the hero's real bottom edge, whatever
   * its height works out to at that viewport. `rootMargin` pulls the top of the
   * observed area down by the header's own height, so the switch lands exactly
   * as the hero's last pixel slides out from behind it.
   *
   * A page with no marked hero observes nothing and stays solid — which is
   * every page but the homepage today.
   */
  useIsomorphicLayoutEffect(() => {
    const hero = document.querySelector('[data-header-transparent]')
    if (!hero) {
      setOverHero(false)
      return
    }

    setOverHero(true)

    const headerH =
      parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 80

    const observer = new IntersectionObserver(([entry]) => setOverHero(entry.isIntersecting), {
      rootMargin: `-${headerH}px 0px 0px 0px`,
      threshold: 0,
    })
    observer.observe(hero)
    return () => observer.disconnect()
  }, [pathname])

  // One frame after the corrected header has painted, allow it to animate.
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Close the mega menu on Escape
  useEffect(() => {
    if (!megaOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMegaOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [megaOpen])

  return (
    <header
      className={cn(
        'sticky top-0 z-30 w-full',
        animate && 'transition-[background-color,backdrop-filter] duration-500 ease-out',
        // Transparent over the hero so its gradient runs to the top of the
        // window with the header floating on it. The mega menu is a panel
        // hanging off the header, so that case always needs something opaque
        // behind the row.
        overHero && !megaOpen
          ? 'bg-transparent backdrop-blur-none'
          : 'bg-background/90 backdrop-blur-sm',
      )}
      {...(heroTheme ? { 'data-theme': heroTheme } : {})}
    >
      {/*
       * Three tracks from `lg`, with the nav in the middle one: the outer two
       * are both `1fr`, so the nav sits at the true centre of the header rather
       * than wherever the logo and the action cluster happen to leave it.
       *
       * A plain flex row below that, and it has to be. The nav is
       * `display: none` there, which takes it out of the grid altogether — so
       * the actions slid into the middle `auto` track, a dead `1fr` column was
       * left over on the right, and the logo was squeezed into 66px of a track
       * sized for 139.
       */}
      <div className="container flex items-center justify-between py-3 sm:py-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="flex shrink-0 items-center lg:justify-self-start">
          <Logo loading="eager" priority="high" className="max-w-30 sm:max-w-none" />
        </Link>

        <div className="hidden lg:flex">
          <HeaderNav />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3 lg:justify-self-end">
          <ThemeToggle />

          {/* Opens a menu — call, WhatsApp, or the full contact page. */}
          <ContactButton channels={channels} />

          {/* Login for a guest, Dashboard for a signed-in client. */}
          <AccountButton />

          {/* Full menu at every breakpoint — the inline bar is deliberately partial.
              Mobile keeps the slide-in drawer; desktop drops a panel over the site. */}
          <div className="lg:hidden">
            <MobileMenu />
          </div>
          <div className="hidden lg:block">
            <MegaMenuButton open={megaOpen} onToggle={() => setMegaOpen((o) => !o)} />
          </div>
        </div>
      </div>

      {/* Full-width panel in the header's flow — expands to push the page down */}
      <MegaMenu open={megaOpen} onClose={() => setMegaOpen(false)} />
    </header>
  )
}
