import type { CollectionConfig } from 'payload'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

import { authenticated } from '../../access/authenticated'
import { anyone } from '../../access/anyone'
import siteConfig from '@/config/site'

export const PageSEO: CollectionConfig = {
  slug: 'page-seo',
  admin: {
    useAsTitle: 'pageSlug',
    group: 'SEO',
    defaultColumns: ['pageSlug', 'meta.title', 'updatedAt'],
    description:
      'Manage the SEO metadata for each hardcoded page. Create one record per page using the URL slug as the identifier.',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'pageSlug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description:
          'The URL path for the page. Use "/" for the home page, "about" for /about, etc.',
        placeholder: 'e.g. about',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: false,
            }),
            MetaDescriptionField({}),
            MetaImageField({
              relationTo: 'media',
            }),
            PreviewField({
              hasGenerateFn: false,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
        {
          label: 'Advanced',
          fields: [
            {
              name: 'noindex',
              type: 'checkbox',
              label: 'No Index',
              defaultValue: false,
              admin: {
                description:
                  'Prevent search engines from indexing this page (adds noindex,nofollow).',
              },
            },
            {
              name: 'canonicalUrl',
              type: 'text',
              label: 'Canonical URL Override',
              admin: {
                description:
                  'Override the canonical URL for this page. Leave blank to use the default URL.',
                placeholder: `e.g. ${siteConfig.url}/about`,
              },
            },
          ],
        },
      ],
    },
  ],
}
