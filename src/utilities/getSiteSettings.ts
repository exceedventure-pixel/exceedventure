import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import configPromise from '@payload-config'
import siteConfig from '@/config/site'

/**
 * Contact channels for the header and contact page.
 *
 * Resolved from the CMS global, falling back to `src/config/site.ts` so the site
 * renders correctly before anyone has opened /admin — and keeps rendering if the
 * database is briefly unreachable. The header is on every page, so this must
 * never be the thing that takes the site down.
 *
 * Cached, because otherwise it is one query per page render for a value that
 * changes a few times a year. The tag lets a CMS save clear it immediately.
 */

export type ContactChannels = {
  phone?: string
  /** `tel:` form — digits only, safe to dial. */
  phoneHref?: string
  whatsapp?: string
  /** Full wa.me link including any pre-filled message. */
  whatsappHref?: string
  email?: string
}

export const SITE_SETTINGS_TAG = 'site-settings'

/** `+44 20 1234 5678` → `+442012345678`. Dialers reject the spaces. */
const telDigits = (value: string) => {
  const trimmed = value.trim()
  const digits = trimmed.replace(/[^\d]/g, '')
  return trimmed.startsWith('+') ? `+${digits}` : digits
}

/** wa.me wants digits only — no `+`, no spaces, no punctuation. */
const waDigits = (value: string) => value.replace(/[^\d]/g, '')

const load = unstable_cache(
  async (): Promise<ContactChannels> => {
    try {
      const payload = await getPayload({ config: configPromise })
      const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })

      const phone = settings?.phone?.trim() || undefined
      const whatsapp = settings?.whatsapp?.trim() || undefined
      const message = settings?.whatsappMessage?.trim()

      return {
        phone,
        phoneHref: phone ? `tel:${telDigits(phone)}` : undefined,
        whatsapp,
        whatsappHref: whatsapp
          ? `https://wa.me/${waDigits(whatsapp)}${message ? `?text=${encodeURIComponent(message)}` : ''}`
          : undefined,
        email: settings?.email?.trim() || siteConfig.contact.email || undefined,
      }
    } catch {
      // The global may not exist yet on a fresh database, and a header must not
      // be able to fail the page. Fall back to what is in code.
      const phone = siteConfig.contact.phone?.trim() || undefined
      return {
        phone,
        phoneHref: phone ? `tel:${telDigits(phone)}` : undefined,
        email: siteConfig.contact.email || undefined,
      }
    }
  },
  ['site-settings'],
  { tags: [SITE_SETTINGS_TAG], revalidate: 3600 },
)

export const getSiteSettings = (): Promise<ContactChannels> => load()
