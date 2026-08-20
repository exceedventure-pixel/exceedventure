/**
 * The testimonial DTO — deliberately narrow and fully serializable.
 *
 * No runtime imports, so this file is safe on both sides of the server/client
 * boundary. The client never receives whole Payload documents: the avatar is
 * resolved to a URL and the initials are computed on the server, so the card
 * renders straight from plain values.
 */

export type Testimonial = {
  id: string
  quote: string
  name: string
  /** Title and company, or null to leave the second line off. */
  role: string | null
  /** 1–5. Clamped on the way out of the CMS so the card can trust it. */
  rating: number
  /** Same-origin media URL, or null to fall back to `initials`. */
  avatarUrl: string | null
  /** One or two letters, pre-computed — the fallback when there is no avatar. */
  initials: string
}
