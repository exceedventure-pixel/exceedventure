'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { Logo } from '@/components/Logo/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { HeaderNav } from './Nav'
import { MobileMenu } from './MobileMenu'

export const HeaderClient: React.FC = () => {
  const [heroTheme, setHeroTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  // Reset hero-override whenever we navigate
  useEffect(() => {
    setHeaderTheme(null)
    setHeroTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Apply hero-override only when a page explicitly requests it
  useEffect(() => {
    setHeroTheme(headerTheme ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header
      className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/90 backdrop-blur-sm"
      {...(heroTheme ? { 'data-theme': heroTheme } : {})}
    >
      <div className="container py-4 flex justify-between items-center">
        <Link href="/">
          <Logo loading="eager" priority="high" />
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex">
            <HeaderNav />
          </div>
          <ThemeToggle />
          <div className="md:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
