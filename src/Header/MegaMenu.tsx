'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ArrowRight, ArrowUpRight, BookOpen, Mail, SearchIcon } from 'lucide-react'
import clsx from 'clsx'
import siteConfig from '@/config/site'

/**
 * Desktop (lg+) menu. The panel lives in the header's normal flow and animates
 * its height open, so the sticky header grows and the whole page below slides
 * down to make room — rather than the panel overlaying the page.
 * Mobile keeps the slide-in drawer; see MobileMenu.
 */

/** Same accent palette as the homepage solution cards, kept literal for Tailwind. */
const ACCENT: Record<string, { tile: string; icon: string; hover: string }> = {
  teal: { tile: 'bg-teal-500/10', icon: 'text-teal-500', hover: 'hover:border-teal-500/50' },
  red: { tile: 'bg-red-500/10', icon: 'text-red-500', hover: 'hover:border-red-500/50' },
  blue: { tile: 'bg-blue-500/10', icon: 'text-blue-500', hover: 'hover:border-blue-500/50' },
  purple: {
    tile: 'bg-purple-500/10',
    icon: 'text-purple-500',
    hover: 'hover:border-purple-500/50',
  },
  emerald: {
    tile: 'bg-emerald-500/10',
    icon: 'text-emerald-500',
    hover: 'hover:border-emerald-500/50',
  },
  amber: { tile: 'bg-amber-500/10', icon: 'text-amber-500', hover: 'hover:border-amber-500/50' },
  pink: { tile: 'bg-pink-500/10', icon: 'text-pink-500', hover: 'hover:border-pink-500/50' },
  indigo: {
    tile: 'bg-indigo-500/10',
    icon: 'text-indigo-500',
    hover: 'hover:border-indigo-500/50',
  },
}
const ACCENT_FALLBACK = { tile: 'bg-muted', icon: 'text-primary', hover: 'hover:border-primary/50' }

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
    {children}
  </div>
)

/** The hamburger trigger. Open state lives in the header so the panel can sit in flow. */
export const MegaMenuButton: React.FC<{ open: boolean; onToggle: () => void }> = ({
  open,
  onToggle,
}) => (
  <button
    aria-label={open ? 'Close menu' : 'Open menu'}
    aria-expanded={open}
    onClick={onToggle}
    className="flex h-8 w-8 flex-col items-center justify-center focus:outline-none"
  >
    <span
      className={clsx(
        'block h-0.5 w-5 origin-center bg-current transition-all duration-300',
        open ? 'translate-y-1.25 rotate-45' : 'mb-1',
      )}
    />
    <span
      className={clsx(
        'block h-0.5 w-5 bg-current transition-all duration-300',
        open ? 'scale-x-0 opacity-0' : 'mb-1',
      )}
    />
    <span
      className={clsx(
        'block h-0.5 w-5 origin-center bg-current transition-all duration-300',
        open ? '-translate-y-1.25 -rotate-45' : '',
      )}
    />
  </button>
)

export const MegaMenu: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => setMounted(true), [])

  // Driven by the same config as the rest of the nav.
  const megaSections = siteConfig.nav.filter((item) => item.megaSection)
  const secondary = siteConfig.nav.filter((item) => !item.children?.length && !item.megaSection)

  return (
    <>
      {/* In-flow panel: animating its height grows the sticky header, so the page
          below slides down instead of being covered. */}
      <div className="hidden lg:block">
        <div
          className={clsx(
            'grid transition-[grid-template-rows] duration-300 ease-out',
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
          aria-hidden={!open}
        >
          <div className={clsx('min-h-0 overflow-hidden', !open && 'pointer-events-none')}>
            <div className="border-t border-border bg-background">
              <div className="container grid grid-cols-1 gap-4 py-8 lg:grid-cols-4">
                {megaSections.map((section) => {
                  const active =
                    pathname === section.href ||
                    (section.href !== '/' && pathname.startsWith(section.href + '/'))

                  return (
                    <div
                      key={section.href}
                      className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <Link
                          href={section.href}
                          className={clsx(
                            'text-sm font-semibold transition-colors hover:text-primary',
                            active ? 'text-primary' : 'text-foreground',
                          )}
                        >
                          {section.label}
                        </Link>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>

                      <div className="space-y-2">
                        {section.children?.map((child) => {
                          const childActive =
                            pathname === child.href || pathname.startsWith(child.href + '/')

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={clsx(
                                'block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-primary',
                                childActive
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-muted-foreground',
                              )}
                            >
                              {child.label}
                            </Link>
                          )
                        })}
                      </div>

                      <Link
                        href={section.href}
                        className="group/all mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                      >
                        View all
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/all:translate-x-1" />
                      </Link>
                    </div>
                  )
                })}
              </div>

              {/* ── Secondary strip: quiet by design, so it can't read as a column of links ── */}
              <div className="border-t border-border bg-muted/40">
                <div className="container flex items-center justify-between py-2.5">
                  <div className="flex flex-wrap items-center gap-0.5">
                    {secondary.map((item) => {
                      const active =
                        pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href + '/'))
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={clsx(
                            'rounded-full px-3 py-1.5 text-xs font-medium transition-colors hover:bg-background hover:text-primary',
                            active ? 'text-primary' : 'text-muted-foreground',
                          )}
                        >
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>

                  <Link
                    href="/search"
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-primary"
                  >
                    <SearchIcon className="h-3.5 w-3.5" />
                    Search
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop dims the pushed-down page and closes the menu on click. */}
      {mounted &&
        createPortal(
          <div
            onClick={onClose}
            aria-hidden="true"
            className={clsx(
              'fixed inset-0 z-20 bg-black/50 backdrop-blur-[3px] transition-opacity duration-300',
              open ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          />,
          document.body,
        )}
    </>
  )
}

export default MegaMenu
