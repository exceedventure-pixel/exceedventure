'use client'

import React from 'react'
import { SlidersHorizontal } from 'lucide-react'

export function BlogFilterButton() {
  return (
    <button
      aria-label="Open category filter"
      onClick={() => document.documentElement.classList.add('blog-category-open')}
      className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
    >
      <SlidersHorizontal className="w-4 h-4" />
      Filters
    </button>
  )
}
