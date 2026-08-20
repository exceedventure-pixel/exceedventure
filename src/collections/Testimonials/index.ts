import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { revalidateTestimonial, revalidateTestimonialDelete } from './hooks/revalidateTestimonials'

/**
 * Client reviews, shown as scrolling columns under the homepage hero.
 *
 * Deliberately small: a quote, who said it, and how many stars. A testimonial
 * that needs more fields than that has stopped being a testimonial and become a
 * case study, which is what `WebsiteShowcase` and `/our-works` are for.
 *
 * The avatar is optional on purpose. Most clients never send a headshot, and a
 * missing one falls back to their initials in the accent colour rather than a
 * grey silhouette — so an entry with nothing but a quote and a name still looks
 * finished. Nothing here needs an image to be publishable.
 *
 * Unpublished rows stay out of the public REST API rather than relying on the
 * frontend to filter them: a draft review is unapproved copy about a real
 * customer, and the homepage is not where it should first appear.
 */
export const Testimonials: CollectionConfig = {
  slug: 'testimonials',
  labels: { singular: 'Review', plural: 'Reviews' },
  defaultSort: 'sortOrder',
  admin: {
    useAsTitle: 'name',
    group: 'Website',
    defaultColumns: ['name', 'role', 'rating', 'published', 'updatedAt'],
    description:
      'Client reviews for the strip under the homepage hero. Publish at least four and the ' +
      'section switches from the built-in placeholder reviews to yours — it is all or nothing, ' +
      'so a half-filled section can never ship by accident.',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    update: authenticated,
    read: ({ req: { user } }) => (user ? true : { published: { equals: true } }),
  },
  hooks: {
    afterChange: [revalidateTestimonial],
    afterDelete: [revalidateTestimonialDelete],
  },
  fields: [
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      maxLength: 320,
      admin: {
        description:
          'What they said, in their words. Two or three sentences — the cards are narrow and ' +
          'they scroll past, so anything longer is never finished.',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Who said it. e.g. "Briana Patton".' },
    },
    {
      name: 'role',
      type: 'text',
      admin: {
        description: 'Their title and company, shown under the name. e.g. "Operations Manager".',
      },
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      defaultValue: 5,
      min: 1,
      max: 5,
      admin: {
        step: 1,
        description: 'Stars, 1 to 5.',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional. Without one the card shows their initials in the accent colour.',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Unpublished reviews are invisible to the public API, not just the page.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      admin: {
        position: 'sidebar',
        step: 1,
        description: 'Lower numbers come first. Ties fall back to newest.',
      },
    },
  ],
}
