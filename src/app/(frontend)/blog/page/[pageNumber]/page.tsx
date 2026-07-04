import type { Metadata } from 'next/types'
import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from '../../page.client'
import siteConfig from '@/config/site'
import { BlogCard } from '../../components/BlogCard'
import { BlogLayout } from '../../components/BlogLayout'
import { Pagination } from '@/components/Pagination'
import type { Category } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ pageNumber: string }>
}

const LIMIT = 9

export default async function BlogPaginatedPage({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const sanitizedPageNumber = Number(pageNumber)
  if (!Number.isInteger(sanitizedPageNumber) || sanitizedPageNumber < 2) notFound()

  const payload = await getPayload({ config: configPromise })

  const [postsResult, categoriesResult] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: LIMIT,
      page: sanitizedPageNumber,
      overrideAccess: false,
      sort: '-publishedAt',
      select: {
        title: true,
        slug: true,
        categories: true,
        meta: true,
        publishedAt: true,
      },
    }),
    payload.find({
      collection: 'categories',
      depth: 1,
      limit: 100,
      overrideAccess: false,
      pagination: false,
    }),
  ])

  const categories = categoriesResult.docs as unknown as Category[]

  return (
    <div className="pb-24">
      <PageClient />

      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container py-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Our Blog
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Ideas, stories &amp; insights
          </h1>
          <p className="text-sm text-muted-foreground">Page {sanitizedPageNumber}</p>
        </div>
      </div>

      {/* Sidebar + grid */}
      <BlogLayout categories={categories} activeCategorySlug={null}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {postsResult.docs.map((post) => (
            <BlogCard key={post.id} doc={post as any} />
          ))}
        </div>

        {postsResult.totalPages > 1 && postsResult.page && (
          <Pagination
            page={postsResult.page}
            totalPages={postsResult.totalPages}
            basePath="/blog/page"
          />
        )}
      </BlogLayout>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `Blog — Page ${pageNumber}`,
    description: `${siteConfig.name} blog, page ${pageNumber}.`,
    robots: { index: false, follow: true },
  }
}

