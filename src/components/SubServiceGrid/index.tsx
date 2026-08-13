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
    <section className="border-t border-border bg-muted/30 py-14 sm:py-16 md:py-24">
      <div className="container">
        <Reveal>
          <h2 className="text-xl font-bold sm:text-2xl md:text-3xl">Explore {parent?.label}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Specialist services within {parent?.label}, each with its own detail.
          </p>
        </Reveal>

        {/* Two up on a phone. These cards are a heading and a line — stacking
            them turns a short list into a long scroll for no extra clarity. */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:mt-10 lg:grid-cols-3 [&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:col-span-1">
          {items.map((item, i) => (
            <Reveal key={item.href} delay={i * 60} className="h-full">
              <Link
                href={item.href}
                className="group/card flex h-full flex-col rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50 sm:p-6"
              >
                <h3 className="flex items-start justify-between gap-2 text-sm font-semibold leading-snug transition-colors group-hover/card:text-primary sm:gap-3 sm:text-base">
                  {item.label}
                  <ArrowRight
                    className="mt-0.5 hidden h-4 w-4 shrink-0 text-muted-foreground transition-all duration-200 group-hover/card:translate-x-0.5 group-hover/card:text-primary sm:block"
                    aria-hidden="true"
                  />
                </h3>
                {item.description && (
                  <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground sm:mt-2 sm:line-clamp-none sm:text-sm">
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
