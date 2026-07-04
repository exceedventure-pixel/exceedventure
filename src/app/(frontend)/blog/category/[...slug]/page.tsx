import type { Metadata } from 'next/types'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from '../../page.client'
import siteConfig from '@/config/site'
import { BlogCard } from '../../components/BlogCard'
import { BlogLayout } from '../../components/BlogLayout'
import { BlogFilterButton } from '../../components/BlogFilterButton'
import { Pagination } from '@/components/Pagination'
import type { Category } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ slug: string[] }>
}

const LIMIT = 9

export default async function BlogCategoryPage({ params: paramsPromise }: Args) {
  const { slug: slugSegments } = await paramsPromise
  // The last segment is the category slug we filter by
  const categorySlug = slugSegments[slugSegments.length - 1]

  const payload = await getPayload({ config: configPromise })

  const [categoryResult, postsResult, categoriesResult] = await Promise.all([
    // Find the active category by slug
    payload.find({
      collection: 'categories',
      where: { slug: { equals: categorySlug } },
      limit: 1,
      overrideAccess: false,
    }),
    // Posts filtered by this category slug
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: LIMIT,
      overrideAccess: false,
      sort: '-publishedAt',
      where: {
        'categories.slug': {
          equals: categorySlug,
        },
      },
      select: {
        title: true,
        slug: true,
        categories: true,
        meta: true,
        publishedAt: true,
      },
    }),
    // All categories for sidebar/drawer
    payload.find({
      collection: 'categories',
      depth: 1,
      limit: 100,
      overrideAccess: false,
      pagination: false,
    }),
  ])

  const activeCategory = categoryResult.docs[0] as Category | undefined
  if (!activeCategory) notFound()

  const categories = categoriesResult.docs as unknown as Category[]

  return (
    <div className="pb-24">
      <PageClient />

      {/* Mobile filter strip — before hero */}
      {categories.length > 0 && (
        <div className="md:hidden border-b border-border">
          <div className="container py-3">
            <BlogFilterButton />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container py-6 md:py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Category
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {activeCategory.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {postsResult.totalDocs} article{postsResult.totalDocs !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Sidebar + grid */}
      <BlogLayout categories={categories} activeCategorySlug={categorySlug}>
        {postsResult.docs.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">No posts in this category yet</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {postsResult.docs.map((post) => (
                <BlogCard key={post.id} doc={post as any} />
              ))}
            </div>

            {postsResult.totalPages > 1 && postsResult.page && (
              <Pagination
                page={postsResult.page}
                totalPages={postsResult.totalPages}
                basePath={`/blog/category/${categorySlug}/page`}
              />
            )}
          </>
        )}
      </BlogLayout>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug: slugSegments } = await paramsPromise
  const categorySlug = slugSegments[slugSegments.length - 1]

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'categories',
    where: { slug: { equals: categorySlug } },
    limit: 1,
    overrideAccess: false,
  })

  const category = result.docs[0]
  const title = category ? `${category.title} — Blog` : 'Category'

  return {
    title,
    description: `Browse all ${category?.title ?? ''} articles on ${siteConfig.name}.`,
  }
}

