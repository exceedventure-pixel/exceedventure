import React from 'react'

import { cn } from '@/utilities/ui'

/**
 * A single enormous hollow word, sitting behind a section as atmosphere.
 *
 * Made for the dead bands this page leaves between sections — a full-height
 * hero with optically centred content hands over a deep strip of nothing, and
 * so does a section that ends on a lone button. Rather than close those gaps,
 * which the layouts either side actually need, this fills them.
 *
 * Hollow rather than tinted: a filled word at this size is a slab the real
 * heading has to fight, while an outline reads as texture. The stroke colour
 * lives in `.outline-word` (globals.css), mixed from `foreground` so it lands
 * at the same weight in both themes.
 *
 * Both the type size and the caller's offset are in `vw`, so the word keeps its
 * proportion to the window and its relationship to the section at every width.
 *
 * Two things to know before moving one:
 *
 *   1. Keep it readable as a word. Past roughly 22vw a short word fills the
 *      viewport edge to edge and stops being lettering at all — it becomes a
 *      handful of abstract curves that happen to sit behind a heading.
 *   2. A negative offset only renders if no ancestor is clipping the vertical
 *      axis. The page wrapper uses `overflow-x-clip` for exactly this reason:
 *      `overflow-x: hidden` would force the other axis to `auto`, making it a
 *      scroll container that silently cuts off everything above its top edge.
 *
 * The caller supplies both the offset and the stacking order, because they
 * differ per section: a section with its own background needs `z-0` and content
 * above it, while a transparent one can take `-z-10`.
 */
export const OutlineWord: React.FC<{
  children: React.ReactNode
  /** Position and stacking — e.g. `-top-[13vw] -z-10`. */
  className?: string
}> = ({ children, className }) => (
  <div
    aria-hidden="true"
    className={cn(
      'pointer-events-none absolute inset-x-0 flex justify-center',
      // Faded to nothing well before its edges, so it reads as something the
      // page is fading through rather than a word that has been cropped.
      '[mask-image:radial-gradient(100%_80%_at_50%_50%,#000_8%,transparent_64%)]',
      className,
    )}
  >
    <span className="outline-word select-none whitespace-nowrap text-[20vw] font-black leading-[0.8] tracking-[-0.04em]">
      {children}
    </span>
  </div>
)
