'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ChevronRight, LayoutDashboard, LogIn, LogOut, UserPlus, X } from 'lucide-react'
import clsx from 'clsx'
import siteConfig, { type NavChild } from '@/config/site'
import { Avatar } from '@/components/Avatar'
import { displayNameFor, signOutPortal, usePortalSession } from './AccountButton'

// ─── Service row (level 2) ────────────────────────────────────────────────────

/**
 * The drawer stops at level two. Third-level pages exist and are in the sitemap,
 * but they surface as cards on their parent's page rather than as menu entries —
 * so this stays a short, scannable list on a phone.
 */
function ServiceRow({ item, onClose }: { item: NavChild; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={clsx(
        'flex items-center gap-2.5 rounded-lg text-sm transition-colors hover:bg-muted',
        item.logoLight ? 'py-2.5 pl-4 pr-3' : 'h-10 pl-4 pr-3',
        pathname === item.href ? 'bg-primary/10 font-medium text-primary' : 'text-foreground/80',
      )}
    >
      {item.logoLight ? (
        <>
          <Image
            src={item.logoLight}
            alt={item.label}
            width={120}
            height={36}
            className="h-8 w-auto object-contain dark:hidden"
          />
          <Image
            src={item.logoDark ?? item.logoLight}
            alt={item.label}
            width={120}
            height={36}
            className="hidden h-8 w-auto object-contain dark:block"
          />
        </>
      ) : (
        <>
          {item.icon && <item.icon className={clsx('w-4 h-4 shrink-0', item.iconColor)} />}
          {item.label}
        </>
      )}
    </Link>
  )
}

// ─── Main nav row (level 1) with icon + optional services accordion ───────────

function NavRow({ item, onClose }: { item: (typeof siteConfig.nav)[number]; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const pathname = usePathname()
  const Icon = item.icon
  const hasChildren = !!item.children?.length

  // Rounded rows with breathing room, rather than a hard rule under every one —
  // the full-width borders were the main thing making the drawer look like a
  // 2014 accordion.
  const rowBase =
    // No horizontal margin here: the group supplies the inset, so `w-full` cannot
    // overflow the drawer the way `mx-2 w-full` did.
    'flex h-12 w-full items-center rounded-lg px-3 text-left text-sm font-medium transition-colors hover:bg-muted'
  const activeText = pathname === item.href ? 'bg-primary/10 text-primary' : 'text-foreground'

  if (!hasChildren) {
    return (
      <Link href={item.href} onClick={onClose} className={clsx(rowBase, activeText)}>
        {Icon && <Icon className="w-4 h-4 mr-3 shrink-0 text-muted-foreground" />}
        {item.label}
      </Link>
    )
  }

  return (
    <>
      <button
        className={clsx(rowBase, activeText, 'justify-between')}
        aria-expanded={expanded}
        onClick={() => setExpanded((p) => !p)}
      >
        <span className="flex items-center">
          {Icon && <Icon className="w-4 h-4 mr-3 shrink-0 text-muted-foreground" />}
          {item.label}
        </span>
        <ChevronRight
          className={clsx(
            'w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200',
            expanded ? 'rotate-90' : '',
          )}
        />
      </button>

      {expanded && (
        <div className="my-1 ml-4 space-y-0.5 border-l-2 border-border/70 pb-1 pl-1">
          <Link
            href={item.href}
            onClick={onClose}
            className={clsx(
              'flex h-10 items-center rounded-lg pl-4 pr-3 text-sm transition-colors hover:bg-muted',
              pathname === item.href ? 'bg-primary/10 font-medium text-primary' : 'text-foreground/70',
            )}
          >
            All {item.label}
          </Link>
          {item.children!.map((child) => (
            <ServiceRow key={child.href} item={child} onClose={onClose} />
          ))}
        </div>
      )}
    </>
  )
}

// ─── Grouped section ─────────────────────────────────────────────────────────

/** A labelled run of rows. The label is quiet — it orients, it does not shout. */
function NavGroup({
  label,
  items,
  onClose,
}: {
  label: string
  items: typeof siteConfig.nav
  onClose: () => void
}) {
  if (items.length === 0) return null

  return (
    <div>
      <p className="px-5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
        {label}
      </p>
      <div className="space-y-0.5 px-2">
        {items.map((item) => (
          <NavRow key={item.href} item={item} onClose={onClose} />
        ))}
      </div>
    </div>
  )
}

// ─── Mobile menu ─────────────────────────────────────────────────────────────

export const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { signedIn, account } = usePortalSession()

  useEffect(() => {
    setMounted(true)
    return () => {
      document.documentElement.classList.remove('mobile-menu-open')
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const open = () => {
    setIsOpen(true)
    document.documentElement.classList.add('mobile-menu-open')
    document.body.style.overflow = 'hidden'
  }

  const close = () => {
    setIsOpen(false)
    document.documentElement.classList.remove('mobile-menu-open')
    document.body.style.overflow = ''
  }

  // Having children is what makes something a solution — the four service
  // categories expand, the standalone pages do not.
  const solutions = siteConfig.nav.filter((item) => !!item.children?.length)
  const pages = siteConfig.nav.filter((item) => !item.children?.length)

  return (
    <>
      {/*
       * Animated hamburger.
       *
       * It sits beside a solid navy Login pill and a bordered Contact pill, and
       * as three bare 2px hairlines it lost that contest — you had to look for
       * it. Now it is a bordered button like its neighbours, with 2.5px bars at
       * a proper 44px touch target.
       */}
      <button
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        onClick={isOpen ? close : open}
        className="flex h-9 w-9 flex-col items-center justify-center gap-1.25 rounded-full border border-border bg-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:h-10 sm:w-10"
      >
        <span
          className={clsx(
            'block h-[2.5px] w-4.5 rounded-full bg-foreground transition-all duration-300 origin-center',
            isOpen && 'translate-y-[7.5px] rotate-45',
          )}
        />
        <span
          className={clsx(
            'block h-[2.5px] w-4.5 rounded-full bg-foreground transition-all duration-300',
            isOpen && 'scale-x-0 opacity-0',
          )}
        />
        <span
          className={clsx(
            'block h-[2.5px] w-4.5 rounded-full bg-foreground transition-all duration-300 origin-center',
            isOpen && 'translate-y-[-7.5px] -rotate-45',
          )}
        />
      </button>

      {/* Portal: backdrop + drawer */}
      {mounted &&
        createPortal(
          <>
            <div className="mobile-drawer-backdrop" onClick={close} aria-hidden="true" />

            <div className="mobile-menu-drawer flex flex-col">
              {/*
               * Account first.
               *
               * Signing up is a real path now, so the drawer opens on *who you
               * are* rather than burying a single "Login / Sign up" button at
               * the bottom under a long accordion. The solid primary bar that
               * used to sit here only carried the site name — the logo in the
               * header already says that.
               */}
              <div className="shrink-0 border-b border-border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold">{siteConfig.name}</span>
                  <button
                    onClick={close}
                    aria-label="Close menu"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {signedIn ? (
                  <div className="flex items-center gap-3">
                    <Avatar size={40} tone="accent" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold capitalize">
                        {displayNameFor(account)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {account?.email ?? 'Signed in'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Avatar size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">Your account</p>
                      <p className="text-xs text-muted-foreground">
                        Track projects and invoices
                      </p>
                    </div>
                  </div>
                )}

                {signedIn ? (
                  <Link
                    href="/portal"
                    onClick={close}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open your client dashboard (opens in a new tab)"
                    className="mt-3 flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden="true" />
                    My dashboard
                  </Link>
                ) : (
                  // Two distinct paths, because they are two distinct intents —
                  // one button labelled "Login / Sign up" made signing up look
                  // like an afterthought.
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link
                      href="/portal/login"
                      onClick={close}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Sign in to the client dashboard (opens in a new tab)"
                      className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-border text-sm font-medium transition-colors hover:bg-muted"
                    >
                      <LogIn className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Sign in
                    </Link>
                    <Link
                      href="/portal/login?mode=signup"
                      onClick={close}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Create a client dashboard account (opens in a new tab)"
                      className="flex h-11 items-center justify-center gap-1.5 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <UserPlus className="h-4 w-4 shrink-0" aria-hidden="true" />
                      Sign up
                    </Link>
                  </div>
                )}
              </div>

              {/*
               * Two groups, not one flat list.
               *
               * What you sell and what you are about are different questions,
               * and mixing them meant Contact sat in the same undifferentiated
               * run as four expandable service categories. The split is derived
               * from the nav itself — anything with children is a solution —
               * so adding a service or a page needs no change here.
               */}
              <nav className="flex-1 overflow-y-auto py-2">
                <NavGroup label="Solutions" items={solutions} onClose={close} />
                <div className="mx-4 my-2 border-t border-border" />
                <NavGroup label="More" items={pages} onClose={close} />
              </nav>

              {/* Footer */}
              <div className="shrink-0 space-y-3 border-t border-border px-4 py-4">
                {signedIn && (
                  <button
                    onClick={async () => {
                      await signOutPortal()
                      close()
                      // A full reload, not router.refresh(): these pages are
                      // force-static, so only a fresh load re-runs the session
                      // check that paints the header.
                      window.location.reload()
                    }}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Sign out
                  </button>
                )}
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="block truncate text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {siteConfig.contact.email}
                </a>
                <p className="text-xs text-muted-foreground/70">
                  &copy; {new Date().getFullYear()} {siteConfig.name}
                </p>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  )
}
