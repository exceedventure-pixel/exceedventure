'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/utilities/ui'
import type { Category } from '@/payload-types'

type Props = {
  categories: Category[]
  activeCategorySlug?: string | null
}

// ─── Individual category row with optional sub-category accordion ─────────────

function CategoryRow({
  cat,
  subCategories,
  activeCategorySlug,
  onClose,
}: {
  cat: Category
  subCategories: Category[]
  activeCategorySlug?: string | null
  onClose: () => void
}) {
  const [expanded, setExpanded] = useState(
    () =>
      activeCategorySlug === cat.slug ||
      subCategories.some((s) => s.slug === activeCategorySlug),
  )
  const hasSubs = subCategories.length > 0

  const rowCls = (slug: string | null) =>
    cn(
      'flex items-center h-11 px-4 border-b border-border text-sm font-medium transition-colors hover:bg-muted w-full text-left',
      activeCategorySlug === slug ? 'text-primary' : 'text-foreground',
    )

  if (!hasSubs) {
    return (
      <Link href={`/blog/category/${cat.slug}`} onClick={onClose} className={rowCls(cat.slug)}>
        {cat.title}
      </Link>
    )
  }

  return (
    <>
      <button
        className={cn(rowCls(cat.slug), 'justify-between')}
        aria-expanded={expanded}
        onClick={() => setExpanded((p) => !p)}
      >
        {cat.title}
        <ChevronRight
          className={cn(
            'w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200',
            expanded ? 'rotate-90' : '',
          )}
        />
      </button>

      {expanded && (
        <div className="bg-muted/40">
          <Link
            href={`/blog/category/${cat.slug}`}
            onClick={onClose}
            className={cn(
              'flex items-center h-10 pl-8 pr-4 border-b border-border text-sm transition-colors hover:bg-muted',
              activeCategorySlug === cat.slug ? 'text-primary font-medium' : 'text-foreground/70',
            )}
          >
            All {cat.title}
          </Link>
          {subCategories.map((sub) => (
            <Link
              key={sub.id}
              href={`/blog/category/${sub.slug}`}
              onClick={onClose}
              className={cn(
                'flex items-center h-10 pl-8 pr-4 border-b border-border text-sm transition-colors hover:bg-muted',
                activeCategorySlug === sub.slug ? 'text-primary font-medium' : 'text-foreground/70',
              )}
            >
              {sub.title}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

// ─── Drawer + trigger button ──────────────────────────────────────────────────

export const CategoryDrawer: React.FC<Props> = ({ categories, activeCategorySlug }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    return () => {
      document.documentElement.classList.remove('blog-category-open')
      document.body.style.overflow = ''
    }
  }, [])

  // Close on navigation
  useEffect(() => {
    close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const open = () => {
    setIsOpen(true)
    document.documentElement.classList.add('blog-category-open')
    document.body.style.overflow = 'hidden'
  }

  const close = () => {
    setIsOpen(false)
    document.documentElement.classList.remove('blog-category-open')
    document.body.style.overflow = ''
  }

  const topLevel = categories.filter(
    (c) => !c.parent || (typeof c.parent === 'object' && c.parent === null),
  )
  const childrenOf = (parentId: number) =>
    categories.filter((c) => typeof c.parent === 'object' && c.parent?.id === parentId)

  return (
    <>
      {/* Mobile trigger button */}
      <button
        onClick={open}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors md:hidden"
        aria-label="Open category filter"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {activeCategorySlug && (
          <span className="ml-1 w-2 h-2 rounded-full bg-primary inline-block" />
        )}
      </button>

      {/* Portal: backdrop + drawer */}
      {mounted &&
        createPortal(
          <>
            <div className="mobile-drawer-backdrop" onClick={close} aria-hidden="true" />

            <div className="blog-category-drawer flex flex-col">
              {/* Header */}
              <div className="relative flex items-center justify-between p-4 flex-shrink-0 bg-primary">
                <span className="text-base font-semibold text-primary-foreground">
                  Filter by Category
                </span>
                <button
                  onClick={close}
                  aria-label="Close filter"
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors"
                >
                  <X className="text-primary-foreground w-4 h-4" />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 overflow-y-auto">
                <Link
                  href="/blog"
                  onClick={close}
                  className={cn(
                    'flex items-center h-12 px-4 border-b border-border text-sm font-medium transition-colors hover:bg-muted w-full',
                    !activeCategorySlug ? 'text-primary' : 'text-foreground',
                  )}
                >
                  All Posts
                </Link>

                {topLevel.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    cat={cat}
                    subCategories={childrenOf(cat.id)}
                    activeCategorySlug={activeCategorySlug}
                    onClose={close}
                  />
                ))}
              </nav>

              {/* Footer */}
              <div className="border-t border-border px-4 py-3 flex-shrink-0 text-xs text-muted-foreground">
                {categories.length} categories available
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  )
}
