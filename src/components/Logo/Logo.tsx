import clsx from 'clsx'
import Image from 'next/image'
import React from 'react'
import siteConfig from '@/config/site'

// Icon mark extracted from favicon.svg. Replace with your brand icon when customising.
// Background uses var(--foreground), paths use var(--background) so it inverts automatically
// between light mode (black square / white icon) and dark mode (white square / black icon).
const LogoMark = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 1000 1000"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="shrink-0"
  >
    <rect width="1000" height="1000" rx="350" style={{ fill: 'var(--foreground)' }} />
    <g transform="matrix(5,0,0,5,192.5,150)">
      <path
        d="M60.2569 118.758L18.9035 94.9917C18.4016 94.6917 18.067 94.1583 18.067 93.5583V56.825C18.067 56.1917 18.7696 55.7917 19.3049 56.0917L67.3164 83.6917C67.9855 84.0917 68.822 83.5917 68.822 82.825V64.925C68.822 64.225 68.4539 63.5583 67.8182 63.1917L10.0707 29.9917C9.56883 29.6917 8.89968 29.6917 8.39782 29.9917L0.836436 34.3583C0.334574 34.6583 0 35.1917 0 35.7917V104.025C0 104.625 0.334574 105.158 0.836436 105.458L60.1565 139.592C60.6583 139.892 61.3275 139.892 61.8293 139.592L111.647 110.925C112.317 110.525 112.317 109.592 111.647 109.192L96.1232 100.258C95.4875 99.8917 94.7515 99.8917 94.1158 100.258L61.9632 118.758C61.4613 119.058 60.7922 119.058 60.2903 118.758H60.2569Z"
        style={{ fill: 'var(--background)' }}
      />
      <path
        d="M121.149 34.325L61.8294 0.225C61.3275 -0.075 60.6584 -0.075 60.1565 0.225L28.8069 18.2583C28.1378 18.6583 28.1378 19.5917 28.8069 19.9917L44.1973 28.8583C44.833 29.225 45.5691 29.225 46.2048 28.8583L60.2569 20.7917C60.7588 20.4917 61.4279 20.4917 61.9298 20.7917L103.283 44.5583C103.785 44.8583 104.12 45.3917 104.12 45.9917V82.8917C104.12 83.5917 104.488 84.2583 105.123 84.625L120.514 93.4583C121.183 93.8583 122.019 93.3583 122.019 92.5917V35.7917C122.019 35.1917 121.685 34.6583 121.183 34.3583L121.149 34.325Z"
        style={{ fill: 'var(--background)' }}
      />
    </g>
  </svg>
)

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = ({ className, loading, priority }: Props) => {
  const { logo, name } = siteConfig

  if (logo.imagePath) {
    return (
      <Image
        alt={name}
        src={logo.imagePath}
        width={160}
        height={36}
        loading={loading ?? 'lazy'}
        fetchPriority={priority ?? 'low'}
        className={clsx('h-9 w-auto', className)}
      />
    )
  }

  return (
    <span
      className={clsx('flex items-center gap-2.5 select-none', className)}
      aria-label={name}
    >
      <LogoMark />
      <span className="font-bold text-xl tracking-tight leading-none">{logo.text ?? name}</span>
    </span>
  )
}
