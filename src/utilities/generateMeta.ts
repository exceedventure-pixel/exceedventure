import type { Metadata } from 'next'
import type { Media, Post, Config } from '../payload-types'
import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import siteConfig from '@/config/site'

// ─── Helpers ───────────────────────────────────────────────────────────────

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null): string => {
  const serverUrl = getServerSideURL()
  const fallback = serverUrl + siteConfig.seo.defaultOgImage

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = (image as Media).sizes?.og?.url
    const rawUrl = ogUrl || (image as Media).url
    if (!rawUrl) return fallback
    // R2/CDN URLs are already absolute — don't prepend serverUrl
    return rawUrl.startsWith('http') ? rawUrl : serverUrl + rawUrl
  }

  return fallback
}

const buildTitle = (metaTitle?: string | null): string =>
  metaTitle
    ? siteConfig.seo.titleTemplate.replace('%s', metaTitle)
    : siteConfig.seo.defaultTitle

// ─── For blog posts (from Posts collection) ────────────────────────────────

export const generatePostMeta = async (args: {
  doc: Partial<Post> | null
}): Promise<Metadata> => {
  const { doc } = args

  const ogImage = getImageURL((doc?.meta as any)?.image)
  const title = buildTitle(doc?.meta?.title)
  const description = doc?.meta?.description ?? siteConfig.seo.defaultDescription
  const url = doc?.slug ? `${getServerSideURL()}/blog/${doc.slug}` : getServerSideURL()

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: mergeOpenGraph({
      description,
      images: [{ url: ogImage }],
      title,
      url,
      type: 'article',
    }),
  }
}

// ─── For hardcoded pages (from PageSEO collection or plain overrides) ──────

type PageSEODoc = {
  meta?: {
    title?: string | null
    description?: string | null
    image?: Media | Config['db']['defaultIDType'] | null
  }
  noindex?: boolean | null
  canonicalUrl?: string | null
}

export const generatePageMeta = async (args: {
  slug: string
  seoDoc?: PageSEODoc | null
  fallbackTitle?: string
  fallbackDescription?: string
}): Promise<Metadata> => {
  const { slug, seoDoc, fallbackTitle, fallbackDescription } = args

  const metaTitle = seoDoc?.meta?.title ?? fallbackTitle
  const metaDescription =
    seoDoc?.meta?.description ?? fallbackDescription ?? siteConfig.seo.defaultDescription

  const ogImage = getImageURL(seoDoc?.meta?.image)
  const title = buildTitle(metaTitle)
  const serverUrl = getServerSideURL()
  const pageUrl = slug === '/' ? serverUrl : `${serverUrl}/${slug}`
  const canonical = seoDoc?.canonicalUrl || pageUrl

  const robots =
    seoDoc?.noindex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true, googleBot: { index: true, follow: true } }

  return {
    title,
    description: metaDescription,
    robots,
    alternates: { canonical },
    openGraph: mergeOpenGraph({
      description: metaDescription,
      images: [{ url: ogImage }],
      title,
      url: canonical,
    }),
  }
}

// ─── Legacy export kept for any remaining callers ──────────────────────────
// (blog [slug]/page.tsx uses generatePostMeta; remove once fully migrated)

export const generateMeta = generatePostMeta
