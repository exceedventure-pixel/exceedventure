'use client'

import { useEffect } from 'react'

import { useAccent } from '@/providers/Accent'
import type { AccentColor } from '@/components/ServiceDetail/colors'

/**
 * Publishes a page's accent colour to the header, and renders nothing.
 *
 * `ServiceHero` is deliberately a server component — the largest text on a
 * service page is static HTML and paints without waiting for JS. Rather than
 * give that up to call a hook, the page drops this beside it.
 *
 * The cleanup is the important half: it fires when the page unmounts, so
 * navigating from a service page to one with no wash of its own hands the
 * header back its brand navy instead of leaving it wearing the last page's
 * colour. React runs a removed subtree's cleanups before the incoming tree's
 * effects, so page-to-page navigation still lands on the new colour.
 */
export const AccentSync: React.FC<{ color: AccentColor }> = ({ color }) => {
  const { setAccent } = useAccent()

  useEffect(() => {
    setAccent(color)
    return () => setAccent('brand')
  }, [color, setAccent])

  return null
}
