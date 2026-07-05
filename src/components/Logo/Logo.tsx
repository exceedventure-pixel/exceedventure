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
        className="h-9 w-auto dark:hidden"
      />
      {/* Dark theme */}
      <Image
        {...imgProps}
        src="/assets/sitelogo.svg"
        className="hidden h-9 w-auto dark:block"
      />
    </span>
  )
}
