import React from 'react'
import { cn } from '@/utilities/ui'
import { Reveal } from '@/components/Reveal'

interface PageHeroProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

/**
 * Centered marketing page hero with soft brand-glow background. Mirrors the
 * old site's PageHero, rebuilt on shadcn tokens.
 */
export const PageHero: React.FC<PageHeroProps> = ({ title, subtitle, children, className }) => {
  return (
    <section
      className={cn(
        'relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden pb-20 pt-32 text-center',
        className,
      )}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-full w-full max-w-7xl -translate-x-1/2">
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
