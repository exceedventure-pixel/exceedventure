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
  purple: { tile: 'bg-purple-500/10', icon: 'text-purple-500', hover: 'hover:border-purple-500/50' },
  emerald: { tile: 'bg-emerald-500/10', icon: 'text-emerald-500', hover: 'hover:border-emerald-500/50' },
  amber: { tile: 'bg-amber-500/10', icon: 'text-amber-500', hover: 'hover:border-amber-500/50' },
  pink: { tile: 'bg-pink-500/10', icon: 'text-pink-500', hover: 'hover:border-pink-500/50' },
  indigo: { tile: 'bg-indigo-500/10', icon: 'text-indigo-500', hover: 'hover:border-indigo-500/50' },
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
  const services = siteConfig.nav.find((i) => i.href === '/solutions')
  const branches = siteConfig.nav.find((i) => i.href === '/ventures')
  const secondary = siteConfig.nav.filter((i) => !i.children?.length)

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
              <div className="container grid grid-cols-12 gap-6 py-8">
                {/* ── Services: the primary destinations, as cards ── */}
                {services && (
                  <div className="col-span-6">
                    <SectionLabel>{services.label}</SectionLabel>

                    <div className="grid grid-cols-2 gap-2.5">
                      {services.children!.map((child) => {
                        const a = (child.color && ACCENT[child.color]) || ACCENT_FALLBACK
                        const active = pathname === child.href
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={clsx(
                              'group/card flex items-center gap-3 rounded-xl border bg-card p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                              active ? 'border-primary/50' : 'border-border/60',
                              a.hover,
                            )}
                          >
                            <span
                              className={clsx(
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover/card:scale-110',
                                a.tile,
                              )}
                            >
                              {child.icon && <child.icon className={clsx('h-5 w-5', a.icon)} />}
                            </span>

                            <span className="text-sm font-semibold leading-tight">{child.label}</span>
                          </Link>
                        )
                      })}
                    </div>

                    <Link
                      href={services.href}
                      className="group/all mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                    >
                      View all solutions
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/all:translate-x-1" />
                    </Link>
                  </div>
                )}

                {/* ── Branches: logo tiles ── */}
                {branches && (
                  <div className="col-span-3">
                    <SectionLabel>{branches.label}</SectionLabel>

                    <div className="space-y-2.5">
                      {branches.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-center justify-center rounded-xl border border-border/60 bg-card px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                        >
                          {child.logoLight ? (
                            <>
                              <Image
                                src={child.logoLight}
                                alt={child.label}
                                width={130}
                                height={40}
                                className="h-9 w-auto object-contain dark:hidden"
                              />
                              <Image
                                src={child.logoDark ?? child.logoLight}
                                alt={child.label}
                                width={130}
                                height={40}
                                className="hidden h-9 w-auto object-contain dark:block"
                              />
                            </>
                          ) : (
                            <span className="text-sm font-medium">{child.label}</span>
                          )}
                        </Link>
                      ))}
                    </div>

                    <Link
                      href={branches.href}
                      className="group/all mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                    >
                      View all branches
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/all:translate-x-1" />
                    </Link>

                    {/* Blogs card — sits beneath the branches list */}
                    <Link
                      href="/blog"
                      className="group/blog mt-4 flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </span>
                      <span className="flex items-center gap-1 text-sm font-semibold leading-tight">
                        Blogs
                        <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover/blog:translate-x-0 group-hover/blog:opacity-100" />
                      </span>
                    </Link>
                  </div>
                )}

                {/* ── CTA ── */}
                <div className="col-span-3">
                  <div className="flex h-full flex-col rounded-2xl border border-border/60 bg-linear-to-br from-primary/5 via-transparent to-secondary/10 p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        Available for new projects
                      </span>
                    </div>

                    <p className="text-lg font-semibold leading-snug">{siteConfig.tagline}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      Tell us what you&apos;re building and we&apos;ll come back to you within one
                      business day.
                    </p>

                    <div className="mt-auto pt-4">
                      <Link
                        href="/contact"
                        className="group/cta mb-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        Start a Project
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-1" />
                      </Link>

                      <a
                        href={`mailto:${siteConfig.contact.email}`}
                        className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-primary"
                      >
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {siteConfig.contact.email}
                      </a>
                    </div>
                  </div>
                </div>
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
