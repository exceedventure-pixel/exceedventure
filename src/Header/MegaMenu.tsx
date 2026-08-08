'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, ArrowUpRight, ChevronRight, Mail, SearchIcon } from 'lucide-react'
import clsx from 'clsx'
import siteConfig from '@/config/site'
import { MenuContactForm } from './MenuContactForm'

/**
 * Desktop (lg+) menu. The panel lives in the header's normal flow and animates
 * its height open, so the sticky header grows and the whole page below slides
 * down to make room — rather than the panel overlaying the page.
 * Mobile keeps the slide-in drawer; see MobileMenu.
 *
 * Layout is a browser rather than a wall of links: a rail of sections on the
 * left drives a detail pane on the right, so only one section's services are on
 * screen at a time and each one can afford a description. Surface colours come
 * from the same --menu-* tokens as the header dropdowns.
 */

// siteConfig is a static import, so these never change — keep them out of render.
const megaSections = siteConfig.nav.filter((item) => item.megaSection)
const secondary = siteConfig.nav.filter((item) => !item.children?.length && !item.megaSection)

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
  const [activeHref, setActiveHref] = useState(megaSections[0]?.href)
  const pathname = usePathname()

  useEffect(() => setMounted(true), [])

  // Always reopen on the first section, so the menu is predictable.
  useEffect(() => {
    if (!open) setActiveHref(megaSections[0]?.href)
  }, [open])

  const active = megaSections.find((s) => s.href === activeHref) ?? megaSections[0]

  /** Cascades the columns in as the panel expands. Merges the column's own classes. */
  const reveal = (delay: number, base: string) => ({
    className: clsx(
      base,
      'transition-all duration-300 ease-out',
      open ? 'translate-y-0 opacity-100' : 'translate-y-1.5 opacity-0',
    ),
    style: { transitionDelay: open ? `${delay}ms` : '0ms' },
  })

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
          {/* inert keeps the links and form fields out of the tab order while the
              panel is collapsed — it stays in the DOM to animate its height. */}
          <div
            className={clsx('min-h-0 overflow-hidden', !open && 'pointer-events-none')}
            inert={!open}
          >
            <div className="border-t border-(--menu-border) bg-(--menu-surface)">
              <div className="container grid grid-cols-1 gap-8 py-8 lg:grid-cols-12">
                {/* ── Rail: hovering or focusing a section swaps the detail pane ── */}
                <div {...reveal(80, 'lg:col-span-3')}>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    What we do
                  </p>

                  <div className="space-y-1">
                    {megaSections.map((section) => {
                      const isActive = section.href === active?.href
                      const onPage =
                        pathname === section.href || pathname.startsWith(section.href + '/')
                      const SectionIcon = section.icon

                      return (
                        <Link
                          key={section.href}
                          href={section.href}
                          onClick={onClose}
                          onMouseEnter={() => setActiveHref(section.href)}
                          onFocus={() => setActiveHref(section.href)}
                          className={clsx(
                            'group/sec flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors duration-200',
                            isActive
                              ? 'bg-(--menu-surface-hover)'
                              : 'hover:bg-(--menu-surface-hover)',
                          )}
                        >
                          <span
                            className={clsx(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200',
                              isActive
                                ? 'border-transparent bg-primary text-primary-foreground'
                                : 'border-(--menu-border) bg-background text-muted-foreground',
                            )}
                          >
                            {SectionIcon && <SectionIcon className="h-4 w-4" aria-hidden="true" />}
                          </span>

                          <span
                            className={clsx(
                              'flex-1 text-sm font-semibold transition-colors duration-200',
                              isActive || onPage ? 'text-foreground' : 'text-muted-foreground',
                            )}
                          >
                            {section.label}
                          </span>

                          <ChevronRight
                            className={clsx(
                              'h-4 w-4 shrink-0 transition-all duration-200',
                              isActive
                                ? 'translate-x-0 text-foreground opacity-100'
                                : '-translate-x-1 text-muted-foreground opacity-0',
                            )}
                            aria-hidden="true"
                          />
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* ── Detail pane for the active section ── */}
                <div
                  {...reveal(140, 'lg:col-span-5 lg:border-l lg:border-(--menu-border) lg:pl-8')}
                >
                  {active && (
                    // Keyed so switching sections replays the entrance.
                    <div key={active.href} className="animate-in fade-in-0 duration-200 ease-out">
                      <Link
                        href={active.href}
                        onClick={onClose}
                        className="group/all mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
                      >
                        All {active.label}
                        <ArrowUpRight
                          className="h-3.5 w-3.5 transition-transform duration-200 group-hover/all:-translate-y-0.5 group-hover/all:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </Link>

                      <div className="space-y-0.5">
                        {active.children?.map((child, i) => {
                          const childActive =
                            pathname === child.href || pathname.startsWith(child.href + '/')
                          const ChildIcon = child.icon

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={onClose}
                              style={{ animationDelay: `${i * 40}ms` }}
                              className={clsx(
                                'group/c flex animate-in items-start gap-3 rounded-xl px-2.5 py-2 fade-in-0 slide-in-from-left-1 duration-300 ease-out fill-mode-both',
                                childActive
                                  ? 'bg-(--menu-surface-hover)'
                                  : 'hover:bg-(--menu-surface-hover)',
                              )}
                            >
                              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-(--menu-border) bg-background">
                                {ChildIcon && (
                                  <ChildIcon
                                    className={clsx(
                                      'h-4 w-4 transition-colors duration-200',
                                      childActive
                                        ? 'text-primary'
                                        : 'text-muted-foreground group-hover/c:text-foreground',
                                    )}
                                    aria-hidden="true"
                                  />
                                )}
                              </span>

                              <span className="min-w-0 flex-1">
                                <span
                                  className={clsx(
                                    'flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200',
                                    childActive
                                      ? 'text-primary'
                                      : 'text-foreground group-hover/c:text-primary',
                                  )}
                                >
                                  {child.label}
                                  <ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover/c:translate-x-0 group-hover/c:opacity-100" />
                                </span>
                                {child.description && (
                                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                                    {child.description}
                                  </span>
                                )}
                              </span>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Chat widget: an elevated card, so it reads as its own thing
                    rather than another column of links ── */}
                <div {...reveal(200, 'lg:col-span-4 lg:pl-4')}>
                  <MenuContactForm />
                </div>
              </div>

              {/* ── Secondary strip: quiet by design, so it can't read as a column of links ── */}
              <div className="border-t border-(--menu-border) bg-(--menu-surface-hover)">
                <div className="container flex items-center justify-between py-2.5">
                  <div className="flex flex-wrap items-center gap-0.5">
                    {secondary.map((item) => {
                      const isOn =
                        pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href + '/'))
                      const ItemIcon = item.icon

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={clsx(
                            'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors hover:bg-background hover:text-foreground',
                            isOn ? 'text-primary' : 'text-muted-foreground',
                          )}
                        >
                          {ItemIcon && <ItemIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>

                  <div className="flex items-center gap-0.5">
                    <a
                      href={`mailto:${siteConfig.contact.email}`}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                    >
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                      {siteConfig.contact.email}
                    </a>
                    <Link
                      href="/search"
                      onClick={onClose}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                    >
                      <SearchIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Search
                    </Link>
                  </div>
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
