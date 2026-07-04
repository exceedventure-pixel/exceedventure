import React from 'react'
import Link from 'next/link'
import { cn } from '@/utilities/ui'
import type { Category } from '@/payload-types'

type Props = {
  categories: Category[]
  activeCategorySlug?: string | null
}

export const CategorySidebar: React.FC<Props> = ({ categories, activeCategorySlug }) => {
  // Split top-level categories (no parent) from sub-categories
  const topLevel = categories.filter(
    (c) => !c.parent || (typeof c.parent === 'object' && c.parent === null),
  )

  const childrenOf = (parentId: number) =>
    categories.filter((c) => typeof c.parent === 'object' && c.parent?.id === parentId)

  const linkCls = (slug: string | null) =>
    cn(
      'block text-sm py-1.5 px-3 rounded-md transition-colors hover:bg-muted hover:text-primary',
      activeCategorySlug === slug
        ? 'bg-primary/10 text-primary font-medium'
        : 'text-foreground/70',
    )

  return (
    <aside className="w-52 shrink-0">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-3">
        Categories
      </p>

      <nav className="flex flex-col gap-0.5">
        {/* All posts */}
        <Link href="/blog" className={linkCls(null)}>
          All Posts
        </Link>

        {topLevel.map((cat) => {
          const subs = childrenOf(cat.id)
          return (
            <React.Fragment key={cat.id}>
              <Link href={`/blog/category/${cat.slug}`} className={linkCls(cat.slug)}>
                {cat.title}
              </Link>

              {subs.length > 0 && (
                <div className="ml-3 flex flex-col gap-0.5 border-l border-border pl-3 mb-1">
                  {subs.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/blog/category/${sub.slug}`}
                      className={linkCls(sub.slug)}
                    >
                      {sub.title}
                    </Link>
                  ))}
                </div>
              )}
            </React.Fragment>
          )
        })}
      </nav>
    </aside>
  )
}
