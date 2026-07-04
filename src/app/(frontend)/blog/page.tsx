import type { Metadata } from 'next/types'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import siteConfig from '@/config/site'
import { Media } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'
import { BlogCard } from './components/BlogCard'
import { BlogLayout } from './components/BlogLayout'
import { BlogFilterButton } from './components/BlogFilterButton'
import { Pagination } from '@/components/Pagination'
import { jsonLdScript, webPageSchema, breadcrumbSchema } from '@/utilities/jsonld'
import type { Category } from '@/payload-types'

export const dynamic = 'force-dynamic'

const LIMIT = 9

export default async function BlogPage() {
  const payload = await getPayload({ config: configPromise })

  const [postsResult, categoriesResult] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: LIMIT + 1, // fetch one extra to know if there's a featured post
      overrideAccess: false,
      sort: '-publishedAt',
      select: {
        title: true,
        slug: true,
        categories: true,
        meta: true,
        publishedAt: true,
        heroImage: true,
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

  const allPosts = postsResult.docs
  const featuredPost = allPosts[0] ?? null
  const gridPosts = allPosts.slice(1, LIMIT + 1)
  const categories = categoriesResult.docs as unknown as Category[]

  return (
    <div className="pb-24">
      <PageClient />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageSchema({
              name: `Blog | ${siteConfig.name}`,
              description: `Read the latest articles, insights and updates from ${siteConfig.name}.`,
              url: `${siteConfig.url}/blog`,
            }),
            breadcrumbSchema([{ name: 'Home', href: '/' }, { name: 'Blog', href: '/blog' }]),
          ]),
        }}
      />

      {/* ── Mobile filter strip — before hero ─────────────────────────── */}
      {categories.length > 0 && (
        <div className="md:hidden border-b border-border">
          <div className="container py-3">
            <BlogFilterButton />
          </div>
        </div>
      )}

      {/* ── Hero header ───────────────────────────────────────────────── */}
      <div className="bg-card border-b border-border">
        <div className="container py-6 md:py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
            Our Blog
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Ideas, stories &amp; insights
          </h1>
          <p className="hidden md:block text-base text-muted-foreground mt-2 max-w-xl">
            Stay up to date with the latest articles on {siteConfig.name} — written by our team.
          </p>
        </div>
      </div>

      {/* ── Featured post ─────────────────────────────────────────────── */}
      {featuredPost && (
        <div className="container pt-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Featured
          </p>
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl transition-all duration-300"
          >
            {/* Image */}
            <div className="relative aspect-video md:aspect-auto min-h-56 bg-muted overflow-hidden">
              {featuredPost.heroImage && typeof featuredPost.heroImage !== 'string' ? (
                <Media
                  resource={featuredPost.heroImage}
                  fill
                  imgClassName="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (featuredPost.meta as any)?.image && typeof (featuredPost.meta as any).image !== 'string' ? (
                <Media
                  resource={(featuredPost.meta as any).image}
                  fill
                  imgClassName="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-primary/5" />
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center p-8 gap-4">
              {Array.isArray(featuredPost.categories) && featuredPost.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {featuredPost.categories.map((cat, i) =>
                    typeof cat === 'object' && cat ? (
                      <span
                        key={i}
                        className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                      >
                        {cat.title}
                      </span>
                    ) : null,
                  )}
                </div>
              )}
              <h2 className="text-2xl md:text-3xl font-bold leading-snug group-hover:text-primary transition-colors">
                {featuredPost.title}
              </h2>
              {featuredPost.meta?.description && (
                <p className="text-muted-foreground line-clamp-3">
                  {featuredPost.meta.description}
                </p>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                {featuredPost.publishedAt && (
                  <time className="text-sm text-muted-foreground" dateTime={featuredPost.publishedAt}>
                    {formatDateTime(featuredPost.publishedAt)}
                  </time>
                )}
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                  Read more <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ── Sidebar + grid ────────────────────────────────────────────── */}
      <BlogLayout categories={categories} activeCategorySlug={null}>
        {gridPosts.length === 0 && !featuredPost ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">No posts yet</p>
            <p className="text-sm">Run <code className="bg-muted px-1 rounded">pnpm seed</code> to add demo content.</p>
          </div>
        ) : gridPosts.length === 0 ? null : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {gridPosts.map((post) => (
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
          </>
        )}
      </BlogLayout>
    </div>
  )
}

export function generateMetadata(): Metadata {
  const title = `Blog | ${siteConfig.name}`
  const description = `Read the latest articles, insights and updates from ${siteConfig.name}.`
  const url = `${siteConfig.url}/blog`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
    },
  }
}
