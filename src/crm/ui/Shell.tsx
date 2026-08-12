'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BriefcaseBusiness,
  ChevronLeft,
  CircleUser,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Library,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Receipt,
  UserCheck,
  Users,
  UsersRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import { ToastHost } from './actions'
import { NotificationBell } from './NotificationBell'
import { Avatar } from '@/components/Avatar'

/**
 * The application shell for both /crm and /portal.
 *
 * A persistent left sidebar on desktop that collapses to icons, and a slide-over
 * on mobile. Both areas share it so they feel like one product family, with the
 * accent colour and nav items telling them apart.
 */

/**
 * Icons are referenced by NAME, not passed as components.
 *
 * These layouts are server components, and React cannot serialise a function
 * across that boundary — passing the lucide component itself throws
 * "Only plain objects can be passed to Client Components". The map lives here,
 * on the client side of the line.
 */
const ICONS = {
  dashboard: LayoutDashboard,
  clients: Users,
  projects: FolderKanban,
  invoices: Receipt,
  payments: Wallet,
  requests: UserCheck,
  messages: MessageSquare,
  mailbox: Mail,
  team: UsersRound,
  work: BriefcaseBusiness,
  resources: Library,
  account: CircleUser,
  inbox: Inbox,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof ICONS

export type NavItem = {
  href: string
  label: string
  icon: IconName
  /** Exact match only — for index routes that would otherwise always look active. */
  exact?: boolean
  /** A count worth interrupting for: pending requests, unread mail. */
  badge?: number
}

export type NavSection = { heading?: string; items: NavItem[] }

export const Shell: React.FC<{
  brand: string
  subtitle: string
  sections: NavSection[]
  account: { name?: string; email: string; role?: string }
  logoutPath: string
  loginPath: string
  /** Where "see all notifications" goes for this area. */
  notificationsHref: string
  unreadNotifications?: number
  /**
   * Drives the accent and the badge in the corner. The two areas looked
   * identical before, which made "am I in the CRM or the client view?" a
   * question you had to answer by reading the nav.
   */
  area: 'crm' | 'portal'
  children: React.ReactNode
}> = ({
  brand,
  subtitle,
  sections,
  account,
  logoutPath,
  loginPath,
  notificationsHref,
  unreadNotifications = 0,
  area,
  children,
}) => {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (item: NavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + '/')

  const logout = async () => {
    await fetch(logoutPath, { method: 'POST' }).catch(() => undefined)
    router.push(loginPath)
    router.refresh()
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {sections.map((section, i) => (
        <div key={section.heading ?? i}>
          {section.heading && !collapsed && (
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
              {section.heading}
            </p>
          )}
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const active = isActive(item)
              const Icon = ICONS[item.icon]
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                  data-active={active}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    // The rail on the active item is drawn in CSS — colour
                    // alone was doing that job, which is weak and disappears
                    // for anyone who cannot separate the two accents.
                    'area-nav-item flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors',
                    active
                      ? 'bg-primary/10 font-semibold text-primary'
                      : 'font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span className="relative shrink-0">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {/* Collapsed to icons, a badge still has to be visible. */}
                    {collapsed && !!item.badge && (
                      <span className="absolute -right-1.5 -top-1.5 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {!!item.badge && (
                        <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-primary">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )

  const sidebarInner = (
    <>
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
          EV
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{brand}</p>
            {/* Which area you are in, stated rather than implied. */}
            <p className="area-eyebrow truncate">{subtitle}</p>
          </div>
        )}
      </div>

      {nav}

      <div className="border-t border-border p-3">
        <div className={cn('flex items-center gap-2.5', collapsed && 'justify-center')}>
          <Avatar size={32} />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{account.name || account.email}</p>
              {account.role && (
                <p className="truncate text-[11px] capitalize text-muted-foreground">
                  {account.role}
                </p>
              )}
            </div>
          )}
          <button
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <ToastHost>
      <div data-area={area} className="area-canvas flex min-h-screen">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            'area-surface sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border transition-[width] duration-200 lg:flex',
            collapsed ? 'w-16' : 'w-60',
          )}
        >
          {sidebarInner}
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground lg:flex"
          >
            <ChevronLeft
              className={cn('h-3.5 w-3.5 transition-transform', collapsed && 'rotate-180')}
            />
          </button>
        </aside>

        {/* Mobile slide-over */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <aside className="area-surface absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border">
              {sidebarInner}
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar. Carries the area name on the right so "which side am I
              on?" is answerable without reading the nav. */}
          <div className="area-surface flex items-center gap-3 border-b border-border px-4 py-2.5">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-md p-1.5 hover:bg-muted lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold lg:hidden">{brand}</span>
            <div className="ml-auto flex items-center gap-2.5">
              <span
                className="hidden rounded-full px-2.5 py-1 text-[11px] font-semibold text-primary sm:inline"
                style={{ backgroundColor: 'var(--area-tint)' }}
              >
                {subtitle}
              </span>
              <NotificationBell
                allHref={notificationsHref}
                initialUnread={unreadNotifications}
                area={area === 'crm' ? 'crm-accounts' : 'client-accounts'}
              />
            </div>
          </div>

          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ToastHost>
  )
}
