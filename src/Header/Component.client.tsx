'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { Logo } from '@/components/Logo/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { HeaderNav } from './Nav'
import { MobileMenu } from './MobileMenu'
import { MegaMenu, MegaMenuButton } from './MegaMenu'

export const HeaderClient: React.FC = () => {
  const [heroTheme, setHeroTheme] = useState<string | null>(null)
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
      className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/90 backdrop-blur-sm"
      {...(heroTheme ? { 'data-theme': heroTheme } : {})}
    >
      <div className="container flex items-center justify-between py-3 sm:py-4">
        <Link href="/" className="flex items-center">
          <Logo loading="eager" priority="high" className="max-w-30 sm:max-w-none" />
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="hidden lg:flex">
            <HeaderNav />
          </div>
          <ThemeToggle />

          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-sm font-medium transition-colors hover:bg-muted sm:gap-2 sm:px-4 sm:py-2"
          >
            {/* Pulsing dot — reads as an "available now" status indicator */}
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Contact
          </Link>

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
