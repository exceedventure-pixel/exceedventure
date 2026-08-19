import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { revalidateShowcase, revalidateShowcaseDelete } from './hooks/revalidateShowcase'

/**
 * Client websites shown in the grid under the homepage hero.
 *
 * Each card renders the *live* site in an iframe and animates it as though
 * somebody is scrolling the page. A screenshot captured by
 * `pnpm capture:showcase` sits underneath as the placeholder, and as the
 * permanent fallback for sites that refuse to be framed.
 *
 * Slug is `website-showcase` rather than `works`: `Projects` is already taken by
 * the CRM and `/our-works` is an existing route, so "works" would be genuinely
 * ambiguous in the admin sidebar.
 *
 * Nothing here is a secret — it is a list of public URLs — but unpublished rows
 * are drafts of marketing copy, so they stay out of the public REST API rather
 * than relying on the frontend to filter them.
 */
export const WebsiteShowcase: CollectionConfig = {
  slug: 'website-showcase',
  labels: { singular: 'Showcase Site', plural: 'Website Showcase' },
  defaultSort: 'sortOrder',
  admin: {
    useAsTitle: 'title',
    group: 'Website',
    defaultColumns: ['title', 'url', 'published', 'updatedAt'],
    description:
      'Live client sites shown under the homepage hero. Add the URL and publish it, then run ' +
      '`pnpm capture:showcase` to fetch the screenshot and check whether the site allows being ' +
      'embedded. A site with no screenshot yet is skipped rather than shown broken.',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    update: authenticated,
    read: ({ req: { user } }) => (user ? true : { published: { equals: true } }),
  },
  hooks: {
    afterChange: [revalidateShowcase],
    afterDelete: [revalidateShowcaseDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Shown on the card. e.g. "Create A Content".' },
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        placeholder: 'https://example.com',
        description: 'The card links here and the live preview loads it.',
      },
      /**
       * https only. A page served over https cannot frame an http document —
       * browsers block it as mixed content and the card would sit on the poster
       * forever with no visible reason why.
       */
      validate: (value: string | null | undefined) => {
        if (!value) return 'Required'
        let parsed: URL
        try {
          parsed = new URL(value)
        } catch {
          return 'Not a valid URL — include https://'
        }
        if (parsed.protocol !== 'https:') {
          return 'Must be an https:// URL. An http site is blocked as mixed content and cannot be embedded.'
        }
        return true
      },
    },
    {
      name: 'displayUrl',
      type: 'text',
      label: 'Address bar label',
      admin: {
        description: 'Optional. What the fake browser bar shows. Defaults to the hostname.',
        placeholder: 'example.com',
      },
    },
    {
      name: 'category',
      type: 'select',
      admin: { description: 'Chip shown on the card.' },
      options: [
        { label: 'Website', value: 'website' },
        { label: 'Web App', value: 'webApp' },
        { label: 'E-commerce', value: 'ecommerce' },
        { label: 'Landing Page', value: 'landing' },
        { label: 'Content Platform', value: 'content' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Filled in by `pnpm capture:showcase` — a full-page screenshot at 1440px wide. This is ' +
          'both the placeholder and the fallback, so a site with no poster is not shown at all.',
      },
    },

    // ─── Sidebar ────────────────────────────────────────────────────────────
    // No size field: the grid is three equal columns, so every card frames its
    // site at the same width and scale. Mixed widths made the same page legible
    // in one card and unreadable in the next.
    {
      // `sortOrder`, not `order`: ORDER is a reserved word in Postgres and would
      // need quoting in every hand-written query and migration.
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Off until you are happy with the screenshot.' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Sorts to the front, above the order number.' },
    },

    // ─── Live embed ─────────────────────────────────────────────────────────
    {
      type: 'group',
      name: 'embed',
      label: 'Live embed',
      admin: {
        description:
          'Controls the hover-scroll live preview. Status and page height are written by the ' +
          'capture script — you only need to touch the mode.',
      },
      fields: [
        {
          name: 'mode',
          type: 'select',
          required: true,
          defaultValue: 'auto',
          options: [
            { label: 'Auto — embed if the site allows it', value: 'auto' },
            { label: 'Always live', value: 'live' },
            { label: 'Screenshot only (never embed)', value: 'poster' },
          ],
          admin: {
            description:
              'Switch to "Screenshot only" for any site with a cookie banner, a full-screen hero, ' +
              'or heavy ads — those look wrong inside a small frame. The screenshot still scrolls, ' +
              'so the card loses nothing visually.',
          },
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'unknown',
          options: [
            { label: 'Not checked yet', value: 'unknown' },
            { label: 'Framing allowed', value: 'allowed' },
            { label: 'Framing blocked', value: 'blocked' },
          ],
          admin: {
            readOnly: true,
            description: 'From the site’s X-Frame-Options / CSP headers at capture time.',
          },
        },
        {
          name: 'reason',
          type: 'text',
          admin: { readOnly: true, description: 'Which header produced that verdict.' },
        },
        { name: 'checkedAt', type: 'date', admin: { readOnly: true } },
        {
          name: 'viewportHeight',
          type: 'number',
          defaultValue: 2600,
          min: 1200,
          max: 4500,
          admin: {
            description:
              'How tall the embedded page renders, in pixels — and therefore how far the hover ' +
              'scroll can travel. Lower it to about 1500 for sites whose hero fills the whole ' +
              'screen, otherwise the preview shows nothing but that hero.',
          },
        },
        {
          name: 'pageHeight',
          type: 'number',
          admin: {
            readOnly: true,
            description: 'Real height of the full page at 1440px wide, measured during capture.',
          },
        },
      ],
    },

    {
      type: 'group',
      name: 'capture',
      label: 'Capture log',
      admin: { description: 'Written by `pnpm capture:showcase`.' },
      fields: [
        { name: 'lastCapturedAt', type: 'date', admin: { readOnly: true } },
        { name: 'error', type: 'text', admin: { readOnly: true } },
      ],
    },
  ],
}
