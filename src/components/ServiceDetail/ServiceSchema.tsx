import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import siteConfig from '@/config/site'
import {
  jsonLdScript,
  webPageSchema,
  servicePageSchema,
  breadcrumbSchema,
} from '@/utilities/jsonld'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * Breadcrumb trail + page-level structured data for a service page.
 *
 * Service pages previously emitted only the site-wide Organization/WebSite
 * schema from the root layout — no WebPage, Service or BreadcrumbList — across
 * all 68 of them. Rendering this from ServiceDetail covers every one from a
 * single place instead of editing each page.
 *
 * The trail is resolved from siteConfig.nav, so it always matches the real
 * information architecture and cannot drift from the menus.
 */

type Crumb = { name: string; href: string }

/** Walks siteConfig.nav to build Home → Section → Service → Sub-service. */
const resolveTrail = (slug: string): Crumb[] => {
  const href = `/${slug.replace(/^\//, '')}`
  const trail: Crumb[] = [{ name: 'Home', href: '/' }]

  for (const section of siteConfig.nav) {
    if (href === section.href) {
      trail.push({ name: section.label, href: section.href })
      return trail
    }
    if (!href.startsWith(section.href + '/')) continue

    trail.push({ name: section.label, href: section.href })

    for (const child of section.children ?? []) {
      if (href === child.href) {
        trail.push({ name: child.label, href: child.href })
        return trail
      }
      if (!href.startsWith(child.href + '/')) continue

      trail.push({ name: child.label, href: child.href })

      const grandchild = (child.children ?? []).find((g) => g.href === href)
      if (grandchild) trail.push({ name: grandchild.label, href: grandchild.href })
      return trail
    }
    return trail
  }

  return trail
}

export const ServiceSchema: React.FC<{
  slug: string
  title: string
  description?: string
  /** Hero deliverables, emitted as the Service's OfferCatalog. */
  offers?: string[]
}> = ({ slug, title, description, offers }) => {
  const siteUrl = getServerSideURL()
  const url = `${siteUrl}/${slug.replace(/^\//, '')}`
  const trail = resolveTrail(slug)

  // Home → Section → Service → Sub-service, so the second entry is the top-level
  // category this page belongs to. Nothing to state on a section page itself.
  const serviceType = trail.length > 2 ? trail[1].name : undefined

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            webPageSchema({ name: title, description, url, siteUrl }),
            servicePageSchema({
              name: title,
              description,
              url,
              providerName: siteConfig.org.legalName,
              siteUrl,
              areaServed: siteConfig.org.areaServed,
              serviceType,
              offers,
            }),
            // Absolute URLs: BreadcrumbList `item` is an entity reference, and
            // Google drops the whole list when it is given a bare path.
            breadcrumbSchema(
              trail.map((crumb) => ({
                name: crumb.name,
                href: `${siteUrl}${crumb.href === '/' ? '' : crumb.href}`,
              })),
            ),
          ]),
        }}
      />
    </>
  )
}

/**
 * Visible trail — backs the BreadcrumbList markup with real navigation and adds
 * the upward internal links these deep pages otherwise lack.
 *
 * Rendered *inside* the hero rather than above it. The hero sizes itself to one
 * screen, so anything sitting between it and the sticky header has to be part
 * of that measurement; as a sibling it pushed the hero down by its own height
 * and guaranteed a scroll on short viewports.
 */
export const ServiceBreadcrumb: React.FC<{ slug: string }> = ({ slug }) => {
  const trail = resolveTrail(slug)
  if (trail.length < 2) return null

  return (
    <nav aria-label="Breadcrumb" className="container">
      <ol className="-my-2 flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-muted-foreground">
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1
          return (
            <li key={crumb.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 opacity-50" aria-hidden="true" />}
              {last ? (
                <span className="py-2 font-medium text-foreground" aria-current="page">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="flex items-center gap-1 py-2 transition-colors hover:text-primary"
                >
                  {i === 0 && <Home className="h-3 w-3 shrink-0" aria-hidden="true" />}
                  {crumb.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default ServiceSchema
