import clsx from 'clsx'
import Image from 'next/image'
import React from 'react'
import siteConfig from '@/config/site'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

/**
 * Exceed Venture wordmark. Two SVGs are rendered and toggled via the `dark:`
 * variant (driven by `data-theme`) so the correct logo shows in each theme
 * with no hydration flash.
 *
 * Deliberately outside the live accent that the header's account pill and the
 * nav's active item follow. The mark is the one thing on the page that has to
 * mean the same thing everywhere, so it keeps its own colours whatever the
 * page behind it is wearing.
 */
export const Logo = ({ className, loading, priority }: Props) => {
  const { name } = siteConfig
  const imgProps = {
    alt: name,
    width: 170,
    height: 44,
    loading: loading ?? 'lazy',
    fetchPriority: priority ?? 'low',
  } as const

  return (
    <span className={clsx('inline-flex items-center select-none', className)} aria-label={name}>
      {/* Light theme */}
      <Image
        {...imgProps}
        src="/assets/sitelogolight.svg"
        className="h-9 w-auto dark:hidden sm:h-12"
      />
      {/* Dark theme */}
      <Image
        {...imgProps}
        src="/assets/sitelogo.svg"
        className="hidden h-9 w-auto dark:block sm:h-12"
      />
    </span>
  )
}
