import type { SiteConfig } from '@/config/site'

// ─── Types ─────────────────────────────────────────────────────────────────

type WithContext<T> = T & { '@context': 'https://schema.org'; '@type': string }

type OrgSchema = WithContext<{
  name: string
  url: string
  logo?: string
  description?: string
  foundingDate?: string
  legalName?: string
  contactPoint?: { '@type': 'ContactPoint'; email?: string; telephone?: string }
  sameAs?: string[]
}>

type WebSiteSchema = WithContext<{
  name: string
  url: string
  description?: string
  potentialAction?: {
    '@type': 'SearchAction'
    target: { '@type': 'EntryPoint'; urlTemplate: string }
    'query-input': string
  }
}>

type WebPageSchema = WithContext<{
  name: string
  description?: string
  url: string
  image?: string
  isPartOf?: { '@type': 'WebSite'; url: string }
}>

type ArticleSchema = WithContext<{
  headline: string
  description?: string
  image?: string
  url: string
  datePublished?: string
  dateModified?: string
  author?: { '@type': 'Person'; name: string }[]
  publisher?: { '@type': 'Organization'; name: string; logo?: object }
}>

type BreadcrumbSchema = WithContext<{
  itemListElement: {
    '@type': 'ListItem'
    position: number
    name: string
    item: string
  }[]
}>

// ─── Schemas ───────────────────────────────────────────────────────────────

export function organizationSchema(config: SiteConfig): OrgSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.name,
    legalName: config.org.legalName || config.name,
    url: config.url,
    description: config.description,
    foundingDate: String(config.org.foundingYear),
    contactPoint: {
      '@type': 'ContactPoint',
      email: config.contact.email,
      telephone: config.contact.phone,
    },
    sameAs: config.social.map((s) => s.href).filter(Boolean),
  }
}

export function websiteSchema(config: SiteConfig): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.name,
    url: config.url,
    description: config.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${config.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function webPageSchema(args: {
  name: string
  description?: string
  url: string
  image?: string
  siteUrl?: string
  type?: string
}): WebPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': args.type ?? 'WebPage',
    name: args.name,
    description: args.description,
    url: args.url,
    image: args.image,
    ...(args.siteUrl ? { isPartOf: { '@type': 'WebSite', url: args.siteUrl } } : {}),
  }
}

export function servicePageSchema(args: {
  name: string
  description?: string
  url: string
  providerName: string
  siteUrl: string
}): WithContext<Record<string, unknown>> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: args.name,
    description: args.description,
    url: args.url,
    provider: {
      '@type': 'Organization',
      name: args.providerName,
      url: args.siteUrl,
    },
  }
}

export function articleSchema(args: {
  title: string
  description?: string
  datePublished?: string
  dateModified?: string
  authorNames?: string[]
  imageUrl?: string
  url: string
  publisherName: string
  publisherUrl: string
}): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: args.title,
    description: args.description,
    image: args.imageUrl,
    url: args.url,
    datePublished: args.datePublished,
    dateModified: args.dateModified,
    author: args.authorNames?.length
      ? args.authorNames.map((name) => ({ '@type': 'Person' as const, name }))
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: args.publisherName,
      logo: {
        '@type': 'ImageObject',
        url: `${args.publisherUrl}/favicon.svg`,
      },
    },
  }
}

export function breadcrumbSchema(items: { name: string; href: string }[]): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href,
    })),
  }
}

// Convenience: serialize to the string used in <script> tags
export function jsonLdScript(schema: object): string {
  return JSON.stringify(schema)
}
