'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/utilities/ui'
import { Media } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'
import useClickableCard from '@/utilities/useClickableCard'
import type { Post } from '@/payload-types'

export type BlogCardPost = Pick<Post, 'slug' | 'categories' | 'meta' | 'title' | 'publishedAt'>

function estimateReadTime(description?: string | null): string {
  if (!description) return '1 min read'
  const words = description.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min read`
}

export const BlogCard: React.FC<{ doc: BlogCardPost; className?: string }> = ({
  doc,
  className,
}) => {
  const { card, link } = useClickableCard({})
  const { slug, categories, meta, title, publishedAt } = doc
  const { description, image: metaImage } = (meta as any) || {}

  const hasCategories = Array.isArray(categories) && categories.length > 0

  return (
    <article
      ref={card.ref}
      className={cn(
        'group flex flex-col rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg hover:border-border/60 transition-all duration-300 cursor-pointer',
        className,
      )}
    >
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {metaImage && typeof metaImage !== 'string' ? (
          <Media
            resource={metaImage}
            size="(max-width: 768px) 100vw, 33vw"
            imgClassName="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Category badges */}
        {hasCategories && (
          <div className="flex flex-wrap gap-1.5">
            {categories!.map((cat, i) => {
              if (typeof cat !== 'object' || !cat) return null
              return (
                <span
                  key={i}
                  className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                >
                  {cat.title}
                </span>
              )
            })}
          </div>
        )}

        {/* Title */}
        <h3 className="text-base font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
          <Link href={`/blog/${slug}`} ref={link.ref} className="focus:outline-none">
            {title}
          </Link>
        </h3>

        {/* Excerpt */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
            {description.replace(/\s/g, ' ')}
          </p>
        )}

        {/* Footer: date + read time */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50 mt-auto">
          {publishedAt ? (
            <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
          ) : (
            <span>Draft</span>
          )}
          <span>{estimateReadTime(description)}</span>
        </div>
      </div>
    </article>
  )
}
