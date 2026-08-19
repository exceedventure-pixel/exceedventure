'use client'

import React, { createContext, use, useCallback, useState } from 'react'

import {
  accentMap,
  type AccentColor,
  type ServiceColorTokens,
} from '@/components/ServiceDetail/colors'

/**
 * The colour the site is currently wearing.
 *
 * Every page already paints a coloured wash behind its hero — teal on websites,
 * blue on marketing, red on automation, purple on branding — and the homepage's
 * opening loop cycles through all four as its slides change. The header floats
 * on top of all of it, so its buttons were the one thing that stayed the same
 * navy no matter what colour was behind them.
 *
 * This is the channel that fixes that: whoever owns the wash publishes its
 * colour here, and any button that wants to match reads it. Two rules keep it
 * from becoming a mess:
 *
 *   1. Only the thing that draws the wash sets it — `AccentSync` on a service
 *      page, the opening loop on the homepage. Nothing else writes.
 *   2. Whoever sets it puts it back to `'brand'` when it goes away, so a page
 *      with no wash of its own is never left wearing the last one's colour.
 *
 * Sibling to `HeaderTheme`, which does the same job for light/dark.
 */

export interface AccentContextType {
  accent: AccentColor
  /** Resolved token set for the current accent — saves every caller a lookup. */
  tokens: ServiceColorTokens
  setAccent: (accent: AccentColor) => void
}

const initialContext: AccentContextType = {
  accent: 'brand',
  tokens: accentMap.brand,
  setAccent: () => null,
}

const AccentContext = createContext(initialContext)

export const AccentProvider = ({ children }: { children: React.ReactNode }) => {
  const [accent, setAccentState] = useState<AccentColor>('brand')

  const setAccent = useCallback((next: AccentColor) => setAccentState(next), [])

  return (
    <AccentContext value={{ accent, tokens: accentMap[accent], setAccent }}>
      {children}
    </AccentContext>
  )
}

export const useAccent = (): AccentContextType => use(AccentContext)
