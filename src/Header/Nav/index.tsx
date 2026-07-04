'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight, SearchIcon } from 'lucide-react'
import clsx from 'clsx'
import siteConfig from '@/config/site'

export const HeaderNav: React.FC = () => {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 items-center">
      {siteConfig.nav.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        const hasChildren = !!item.children?.length

        if (!hasChildren) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-primary',
                isActive ? 'text-primary' : 'text-foreground/80',
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {item.label}
            </Link>
          )
        }

        // Item with children — hover dropdown + flyout sub-menu
        return (
          <div key={item.href} className="relative group/top">
            {/* Trigger row */}
            <button
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-primary',
                isActive ? 'text-primary' : 'text-foreground/80',
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {item.label}
              <ChevronDown className="w-3 h-3 transition-transform duration-200 group-hover/top:rotate-180" />
            </button>

            {/* Dropdown panel — bridge gap with pt-1 */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover/top:block z-50 pt-1">
              <div className="bg-background border border-border rounded-lg shadow-lg min-w-44 py-1">
                {/* "All Services" link */}
                <Link
                  href={item.href}
                  className={clsx(
                    'flex items-center px-4 py-2 text-sm transition-colors hover:bg-muted hover:text-primary border-b border-border mb-1',
                    pathname === item.href ? 'text-primary font-medium' : 'text-foreground/80',
                  )}
                >
                  All {item.label}
                </Link>

                {item.children!.map((child) => {
                  const childActive =
                    pathname === child.href || pathname.startsWith(child.href + '/')
                  const hasGrandchildren = !!child.children?.length

                  if (!hasGrandchildren) {
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={clsx(
                          'flex items-center px-4 py-2 text-sm transition-colors hover:bg-muted hover:text-primary',
                          childActive ? 'text-primary font-medium' : 'text-foreground/80',
                        )}
                      >
                        {child.label}
                      </Link>
                    )
                  }

                  // Child with grandchildren — flyout to the right
                  return (
                    <div key={child.href} className="relative group/child">
                      <Link
                        href={child.href}
                        className={clsx(
                          'flex items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-muted hover:text-primary',
                          childActive ? 'text-primary font-medium' : 'text-foreground/80',
                        )}
                      >
                        {child.label}
                        <ChevronRight className="w-3 h-3 text-muted-foreground ml-2 shrink-0" />
                      </Link>

                      {/* Flyout panel */}
                      <div className="absolute left-full top-0 hidden group-hover/child:block z-50 pl-1">
                        <div className="bg-background border border-border rounded-lg shadow-lg min-w-44 py-1">
                          {child.children!.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={clsx(
                                'flex items-center px-4 py-2 text-sm transition-colors hover:bg-muted hover:text-primary',
                                pathname === sub.href
                                  ? 'text-primary font-medium'
                                  : 'text-foreground/80',
                              )}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}

      <Link href="/search" aria-label="Search" className="p-2 rounded-md hover:bg-muted transition-colors">
        <SearchIcon className="w-4 h-4 text-primary" />
      </Link>
    </nav>
  )
}
