import React from 'react'
import { Check, type LucideIcon } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { Reveal } from '@/components/Reveal'
import { ServiceSchema, ServiceBreadcrumb } from './ServiceSchema'
import { ServiceHero, type ServiceHeroContent } from './ServiceHero'
import { colorMap, type ServiceColor } from './colors'

export type { ServiceColor }
export type { ServiceHeroContent, ServiceCta, ServiceStat } from './ServiceHero'

export interface ServiceFeature {
  title: string
  icon: LucideIcon
  desc: string
  /** Optional checklist of what's included, rendered under the description. */
  items?: string[]
}

export interface ServiceFeatureGroup {
  label: string
  features: ServiceFeature[]
}

export interface ServiceSection {
  color: ServiceColor
  badge?: string
  title: string
  subtitle: string
  /** Flat list of cards. Provide this OR `groups`. */
  features?: ServiceFeature[]
  /** Cards split into labeled groups, each rendered under a small heading. */
  groups?: ServiceFeatureGroup[]
  /** Render a subtle muted background band (used for secondary sections). */
  muted?: boolean
  /** Cards per row on large screens. Defaults to 3. */
  cols?: 3 | 4
}

interface ServiceDetailProps {
  color: ServiceColor
  icon: LucideIcon
  badge: string
  titleLead: string
  titleAccent: string
  subtitle: string
  sections: ServiceSection[]
  /**
   * URL path without the leading slash, e.g. 'websites-softwares/wordpress'.
   * Drives the breadcrumb trail and the page-level JSON-LD. Optional so the
   * component still renders if a page has not been given one yet.
   */
  slug?: string
  /**
   * Conversion copy for the hero — pain, outcomes, CTAs, proof. Every field is
   * optional and falls back to something derived from the props above, so a
   * page that has not been written yet still renders a complete hero.
   */
  hero?: ServiceHeroContent
}

// Two columns from the smallest screen up. A column of full-width cards is a
// lot of scrolling for very little information, and these cards carry a title
// and a sentence — they read fine at half width once the type and padding step
// down with them.
const gridClass = (cols?: 3 | 4) =>
  cols === 4
    ? 'grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4'
    : 'grid grid-cols-2 gap-3 sm:gap-6 lg:gap-8 lg:grid-cols-3'

/**
 * Which cards run the full width of a phone.
 *
 * Two cases: a card carrying a checklist has too much in it for half a screen,
 * and a card that would otherwise sit alone on the final row looks like a
 * mistake. Widening both is what gives the grid its alternating rhythm instead
 * of a uniform ladder of boxes.
 */
function fullWidthFlags(features: ServiceFeature[]): boolean[] {
  const flags: boolean[] = []
  let col = 0
  features.forEach((feature, i) => {
    const hasList = Boolean(feature.items?.length)
    const strandedLast = i === features.length - 1 && col === 0
    if (hasList || strandedLast) {
      flags[i] = true
      col = 0
      return
    }
    flags[i] = false
    col = (col + 1) % 2
  })
  return flags
}

function FeatureCard({
  feature,
  color,
  index,
  fullWidth,
}: {
  feature: ServiceFeature
  color: ServiceColor
  index: number
  fullWidth?: boolean
}) {
  const c = colorMap[color]
  const Icon = feature.icon
  return (
    <Reveal
      delay={index * 60}
      className={cn(
        'group rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:p-6 lg:p-8',
        fullWidth && 'col-span-2 lg:col-span-1',
        c.card,
      )}
    >
      <div
        className={cn(
          'mb-3 w-fit rounded-xl p-2.5 transition-transform duration-200 group-hover:scale-110 sm:mb-5 sm:p-3.5 lg:mb-6 lg:p-4',
          c.cardIcon,
        )}
      >
        <Icon className="h-5 w-5 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
      </div>
      <h3 className="mb-1.5 text-sm font-bold leading-snug sm:mb-3 sm:text-lg lg:text-xl">
        {feature.title}
      </h3>
      <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm lg:text-base">
        {feature.desc}
      </p>
      {feature.items && feature.items.length > 0 && (
        <ul className="mt-4 grid gap-2 sm:mt-5 sm:gap-2.5 lg:grid-cols-1">
          {feature.items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-xs text-muted-foreground sm:gap-2.5 sm:text-sm"
            >
              <Check className={cn('mt-0.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4', c.accent)} />
              {item}
            </li>
          ))}
        </ul>
      )}
    </Reveal>
  )
}

function FeatureGrid({ section }: { section: ServiceSection }) {
  const c = colorMap[section.color]
  return (
    <section
      className={cn(
        'relative pb-16 pt-14 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20',
        section.muted && 'rounded-t-4xl bg-muted/30 sm:rounded-t-[3rem]',
      )}
    >
      <div
        className={cn(
          'absolute left-0 top-0 h-1 w-full bg-linear-to-r from-transparent to-transparent opacity-50',
          c.divider,
        )}
      />
      <div className="container">
        <div className="mb-10 text-center sm:mb-14 lg:mb-16">
          {section.badge && (
            <div
              className={cn(
                'mb-4 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider sm:px-4 sm:text-sm',
                c.badge,
              )}
            >
              {section.badge}
            </div>
          )}
          <h2 className="mb-4 text-2xl font-bold sm:mb-6 sm:text-4xl lg:text-5xl">
            {section.title}
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg">
            {section.subtitle}
          </p>
        </div>

        {section.groups ? (
          <div className="space-y-10 sm:space-y-14">
            {section.groups.map((group) => (
              <div key={group.label}>
                <div className="mb-5 flex items-center gap-4 sm:mb-6">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-sm">
                    {group.label}
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className={gridClass(section.cols)}>
                  {(() => {
                    const flags = fullWidthFlags(group.features)
                    return group.features.map((feature, i) => (
                      <FeatureCard
                        key={feature.title}
                        feature={feature}
                        color={section.color}
                        index={i}
                        fullWidth={flags[i]}
                      />
                    ))
                  })()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={gridClass(section.cols)}>
            {(() => {
              const features = section.features ?? []
              const flags = fullWidthFlags(features)
              return features.map((feature, i) => (
                <FeatureCard
                  key={feature.title}
                  feature={feature}
                  color={section.color}
                  index={i}
                  fullWidth={flags[i]}
                />
              ))
            })()}
          </div>
        )}
      </div>
    </section>
  )
}

export const ServiceDetail: React.FC<ServiceDetailProps> = ({
  color,
  icon: Icon,
  badge,
  titleLead,
  titleAccent,
  subtitle,
  sections,
  slug,
  hero,
}) => {
  // The first section is the page's own description of the work, so it is the
  // best source of hero copy for pages that have not been given any yet.
  const primarySection = sections[0]
  const primaryFeatures =
    primarySection?.features ?? primarySection?.groups?.flatMap((group) => group.features) ?? []

  return (
    <div className="flex min-h-screen flex-col">
      {/* WebPage / Service / BreadcrumbList JSON-LD. The visible trail is a
          separate component because it renders inside the hero — see
          ServiceBreadcrumb for why. */}
      {slug && (
        <ServiceSchema
          slug={slug}
          title={`${titleLead}${titleAccent}`}
          description={hero?.pain ?? subtitle}
          offers={primaryFeatures.map((feature) => feature.title)}
        />
      )}

      <ServiceHero
        {...hero}
        color={color}
        icon={Icon}
        badge={hero?.badge ?? badge}
        titleLead={titleLead}
        titleAccent={titleAccent}
        subtitle={subtitle}
        fallbackPoints={primaryFeatures.slice(0, 3).map((feature) => feature.title)}
        breadcrumb={slug ? <ServiceBreadcrumb slug={slug} /> : undefined}
      />

      {sections.map((section, i) => (
        <FeatureGrid key={i} section={section} />
      ))}
    </div>
  )
}
