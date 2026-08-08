import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import siteConfig from '@/config/site'
import { Reveal } from '@/components/Reveal'

/**
 * Renders a service's third-level pages as cards.
 *
 * The header menus deliberately stop at level two, so this is where those pages
 * become reachable for people — while the sitemap carries every one of them for
 * search engines. Driven from siteConfig, so adding a page to the nav config is
 * all it takes for the card to appear.
 */
export const SubServiceGrid: React.FC<{ parentHref: string }> = ({ parentHref }) => {
  const parent = siteConfig.nav
    .flatMap((section) => section.children ?? [])
    .find((child) => child.href === parentHref)

  const items = parent?.children ?? []
  if (!items.length) return null

  return (
    <section className="border-t border-border bg-muted/30 py-16 md:py-24">
      <div className="container">
        <Reveal>
          <h2 className="text-2xl font-bold md:text-3xl">Explore {parent?.label}</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Specialist services within {parent?.label}, each with its own detail.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.href} delay={i * 60}>
              <Link
                href={item.href}
                className="group/card flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <h3 className="flex items-start justify-between gap-3 text-base font-semibold transition-colors group-hover/card:text-primary">
                  {item.label}
                  <ArrowRight
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-all duration-200 group-hover/card:translate-x-0.5 group-hover/card:text-primary"
                    aria-hidden="true"
                  />
                </h3>
                {item.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SubServiceGrid
