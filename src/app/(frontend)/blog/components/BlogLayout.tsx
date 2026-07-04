'use client'

import React from 'react'
import { CategorySidebar } from './CategorySidebar'
import { CategoryDrawer } from './CategoryDrawer'
import type { Category } from '@/payload-types'

type Props = {
  categories: Category[]
  activeCategorySlug?: string | null
  children: React.ReactNode
}

export const BlogLayout: React.FC<Props> = ({ categories, activeCategorySlug, children }) => {
  return (
    <div className="container py-12">
      {/* Mobile filter trigger — filter button left, label right */}
      <div className="flex items-center gap-3 mb-6 md:hidden">
        <CategoryDrawer categories={categories} activeCategorySlug={activeCategorySlug} />
        <p className="text-sm text-muted-foreground">
          {activeCategorySlug ? `Filtered by category` : 'All articles'}
        </p>
      </div>

      {/* Desktop: sidebar + main */}
      <div className="flex gap-10">
        {/* Sidebar — desktop only */}
        {categories.length > 0 && (
          <div className="hidden md:block">
            <CategorySidebar categories={categories} activeCategorySlug={activeCategorySlug} />
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
