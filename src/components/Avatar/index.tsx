import React from 'react'
import { UserRound } from 'lucide-react'
import { cn } from '@/utilities/ui'

/**
 * The stand-in profile picture, used everywhere an account is shown.
 *
 * Replaces the initials badges ("E", "TD") that were scattered around. Initials
 * read as a placeholder for a *missing* avatar rather than as an avatar, and
 * they get strange fast — an account with no name fell back to the first letter
 * of an email address, so people were labelled "h" or "o".
 *
 * A single silhouette is honest about being generic, and gives one obvious slot
 * to drop real uploaded pictures into later: add an `src` here and every
 * placement gets them at once.
 */
export const Avatar: React.FC<{
  /** Pixel size of the circle. */
  size?: number
  /** `onPrimary` for use inside a filled primary button, where a tinted grey disappears. */
  tone?: 'muted' | 'onPrimary' | 'accent'
  className?: string
  /** Described by neighbouring text in every current placement. */
  label?: string
}> = ({ size = 32, tone = 'muted', className, label }) => {
  const tones = {
    muted: 'bg-muted text-muted-foreground',
    onPrimary: 'bg-primary-foreground/20 text-primary-foreground',
    accent: 'bg-primary/10 text-primary',
  } as const

  return (
    <span
      // Always a circle: it is what a profile picture looks like, and it tells
      // an account apart from the square brand mark at a glance.
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        tones[tone],
        className,
      )}
      style={{ width: size, height: size }}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' })}
    >
      <UserRound style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={2} />
    </span>
  )
}

export default Avatar
