/**
 * The showcase DTO — deliberately narrow and fully serializable.
 *
 * No runtime imports, so this file is safe on both sides of the server/client
 * boundary. Every decision (can this be framed? what is the hostname?) is
 * resolved up front in `items.ts` and arrives here as a plain value.
 */

export type ShowcaseItem = {
  id: number
  title: string
  /** Where the card links, and what the iframe loads. Always https. */
  url: string
  /** Pre-computed hostname — `new URL()` on every render would be waste. */
  host: string
  /** What the fake address bar shows. */
  displayUrl: string
  /** Human label for the category chip, or null to hide it. */
  category: string | null
  posterUrl: string
  /** Height of the poster at 1440px wide — the scroll distance when poster-only. */
  posterHeight: number
  /**
   * Whether this card may mount a live iframe at all. Resolved server-side from
   * the embed mode, the measured framing status, and the same-origin guard.
   */
  canEmbed: boolean
  /** Iframe render height in CSS px — the scroll distance when live. */
  viewportHeight: number
}
