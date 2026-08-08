'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ChevronRight, X } from 'lucide-react'
import clsx from 'clsx'
import siteConfig, { type NavChild } from '@/config/site'

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
        'flex items-center gap-2.5 border-b border-border text-sm transition-colors hover:bg-muted',
        item.logoLight ? 'py-3 pl-8 pr-4' : 'h-11 pl-8 pr-4',
        pathname === item.href ? 'text-primary font-medium' : 'text-foreground/80',
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

  const rowBase =
    'flex items-center h-12 px-4 border-b border-border text-sm font-medium transition-colors hover:bg-muted w-full text-left'
  const activeText = pathname === item.href ? 'text-primary' : 'text-foreground'

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
        <div className="bg-muted/40">
          <Link
            href={item.href}
            onClick={onClose}
            className={clsx(
              'flex items-center h-10 pl-8 pr-4 border-b border-border text-sm transition-colors hover:bg-muted',
              pathname === item.href ? 'text-primary font-medium' : 'text-foreground/70',
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

// ─── Mobile menu ─────────────────────────────────────────────────────────────

export const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

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

  return (
    <>
      {/* Animated hamburger */}
      <button
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        onClick={isOpen ? close : open}
        className="flex flex-col justify-center items-center w-8 h-8 focus:outline-none"
      >
        <span
          className={clsx(
            'block w-5 h-0.5 bg-current transition-all duration-300 origin-center',
            isOpen ? 'rotate-45 translate-y-1.25' : 'mb-1',
          )}
        />
        <span
          className={clsx(
            'block w-5 h-0.5 bg-current transition-all duration-300',
            isOpen ? 'opacity-0 scale-x-0' : 'mb-1',
          )}
        />
        <span
          className={clsx(
            'block w-5 h-0.5 bg-current transition-all duration-300 origin-center',
            isOpen ? '-rotate-45 -translate-y-1.25' : '',
          )}
        />
      </button>

      {/* Portal: backdrop + drawer */}
      {mounted &&
        createPortal(
          <>
            <div className="mobile-drawer-backdrop" onClick={close} aria-hidden="true" />

            <div className="mobile-menu-drawer flex flex-col">
              {/* Header */}
              <div className="relative flex items-center justify-between p-4 shrink-0 bg-primary">
                <span className="text-base font-semibold text-primary-foreground">
                  {siteConfig.name}
                </span>
                <button
                  onClick={close}
                  aria-label="Close menu"
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors"
                >
                  <X className="text-primary-foreground w-4 h-4" />
                </button>
              </div>

              {/* Nav accordion */}
              <nav className="flex-1 overflow-y-auto">
                {siteConfig.nav.map((item) => (
                  <NavRow key={item.href} item={item} onClose={close} />
                ))}
              </nav>

              {/* Footer */}
              <div className="border-t border-border px-4 py-4 shrink-0">
                <p className="text-xs text-muted-foreground">
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
