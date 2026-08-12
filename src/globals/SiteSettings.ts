import type { GlobalConfig } from 'payload'
import { revalidateTag } from 'next/cache'
import { anyone } from '@/access/anyone'
import { isCmsAdmin } from '@/access/roles'
import { SITE_SETTINGS_TAG } from '@/utilities/getSiteSettings'

/**
 * Site-wide settings, edited in the CMS at /admin.
 *
 * These live in the **CMS, not the CRM**, on purpose. The CRM is scoped to
 * clients, projects and invoices — the people and money side of the business.
 * A phone number printed on the public website is website content, and belongs
 * with the other website content (SEO, posts, media) under the same editors.
 * Putting it in the CRM would mean a manager running client work also owns what
 * the marketing site says, which is the boundary the two areas exist to keep.
 *
 * A Payload *global* rather than a collection: there is exactly one of these,
 * so a list view with one row in it would be noise.
 *
 * Read access is public because the header renders on every page. Nothing
 * sensitive belongs here — it is all information the site publishes anyway.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: anyone,
    // Contact numbers on the public site are configuration, not content — an
    // editor should not be able to change where enquiries are routed.
    update: isCmsAdmin,
  },
  admin: {
    description: 'Contact channels shown in the site header and on the contact page.',
  },
  hooks: {
    /**
     * The header caches these for an hour; a save should take effect now.
     *
     * Guarded the same way the Posts hooks are: `revalidateTag` only works
     * inside a Next request, and throws "static generation store missing"
     * anywhere else — a seed script, a migration, a background job. Without the
     * guard, saving these settings from the Local API fails outright.
     */
    afterChange: [
      ({ req: { payload, context } }) => {
        if (context?.disableRevalidate) return
        try {
          revalidateTag(SITE_SETTINGS_TAG, 'max')
        } catch {
          payload.logger.info('site-settings saved outside a request; cache will expire normally.')
        }
      },
    ],
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Contact channels',
      admin: {
        description:
          'Leave a field empty to hide that option. The header Contact button shows whichever are filled in.',
      },
      fields: [
        {
          name: 'phone',
          type: 'text',
          label: 'Phone number',
          admin: {
            description:
              'Shown as-is and dialled on tap. Write it how you want it read, e.g. +44 20 1234 5678.',
          },
        },
        {
          name: 'whatsapp',
          type: 'text',
          label: 'WhatsApp number',
          admin: {
            description:
              'Full international number, e.g. +44 20 1234 5678. Spaces and symbols are stripped for the link, so type it however you like. Often the same as the phone number, but it does not have to be.',
          },
        },
        {
          name: 'whatsappMessage',
          type: 'textarea',
          label: 'WhatsApp opening message',
          admin: {
            description:
              'Pre-filled in the chat so you know which page they came from. Leave empty for a blank chat.',
          },
        },
        {
          name: 'email',
          type: 'email',
          label: 'Contact email',
          admin: { description: 'Falls back to the address in site config when empty.' },
        },
      ],
    },
  ],
}

export default SiteSettings
