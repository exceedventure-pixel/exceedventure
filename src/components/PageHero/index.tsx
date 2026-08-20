import React from 'react'
import { Sparkles, type LucideIcon } from 'lucide-react'

import { cn } from '@/utilities/ui'
import { Reveal } from '@/components/Reveal'
import { SplitHero, type HeroCta } from '@/components/SplitHero'
import { brandTokens, type ServiceColorTokens } from '@/components/ServiceDetail/colors'

interface PageHeroProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  children?: React.ReactNode
  className?: string
  /**
   * `split` is the site's hero — the homepage's opening slide, with a badge, a
   * drawn rule under the accent, a card and a call to action. `compact` is the
   * old quiet band, kept for the pages where a full screen and a "start a
   * project" button would be wrong: the privacy policy, the terms, the FAQs.
   */
  variant?: 'split' | 'compact'
  /** Accented tail of the title. Only `split` uses it, and rules it. */
  titleAccent?: string
  badge?: string
  icon?: LucideIcon
  primaryCta?: HeroCta
  secondaryCta?: HeroCta
  /** Defaults to the brand's own colour. */
  tokens?: ServiceColorTokens
  outlineWord?: string
}

/**
 * The hero for every page that is neither a service page nor the homepage.
 *
 * Service pages have their own — `ServiceDetail/ServiceHero` — because they
 * carry symptoms, stats and a colour of their own. Both render the same
 * `SplitHero` underneath, so the two stay in step by construction rather than
 * by anyone remembering to update both.
 */
export const PageHero: React.FC<PageHeroProps> = ({
  title,
  subtitle,
  children,
  className,
  variant = 'split',
  titleAccent,
  badge = 'Exceed Venture',
  icon = Sparkles,
  primaryCta = { label: 'Start a project', href: '/contact' },
  secondaryCta,
  tokens = brandTokens,
  outlineWord,
}) => {
  if (variant === 'split') {
    return (
      <SplitHero
        badge={badge}
        icon={icon}
        tokens={tokens}
        headline={title}
        headlineAccent={titleAccent}
        sub={subtitle}
        primaryCta={primaryCta}
        secondaryCta={secondaryCta}
        outlineWord={outlineWord}
      >
        {children}
      </SplitHero>
    )
  }

  return (
    <section
      // Marks this as a hero the header may sit transparently on top of.
      data-header-transparent=""
      className={cn(
        // Pulled up under the header and padded back down by the same amount,
        // so the glow starts at the top of the window with the header floating
        // on it rather than beginning on a hard line beneath it.
        'relative -mt-[var(--header-h)] flex min-h-[calc(60vh+var(--header-h))] flex-col items-center justify-center overflow-hidden pb-20 pt-[calc(8rem+var(--header-h))] text-center',
        className,
      )}
    >
      {/* Background glow. Faded out before the foot: the section clips its
          overflow, so without the mask the orbs end on a hard horizontal line
          exactly where the next section begins. */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-full w-full max-w-7xl -translate-x-1/2 [mask-image:linear-gradient(to_bottom,#000_0%,#000_62%,transparent_100%)]">
        <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="container flex flex-col items-center">
        <Reveal className="z-10 flex max-w-4xl flex-col items-center">
          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mb-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {subtitle}
            </p>
          )}
          {children}
        </Reveal>
      </div>
    </section>
  )
}
