import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { s3Storage } from '@payloadcms/storage-s3'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import siteConfig from '@/config/site'

const generateTitle: GenerateTitle<Post> = ({ doc }) => {
  return doc?.title
    ? siteConfig.seo.titleTemplate.replace('%s', doc.title)
    : siteConfig.seo.defaultTitle
}

const generateURL: GenerateURL<Post> = ({ doc }) => {
  const url = getServerSideURL()
  return doc?.slug ? `${url}/blog/${doc.slug}` : url
}

/**
 * Whether uploads actually go to Cloudflare R2.
 *
 * A bucket is still required — an environment with no S3_BUCKET has nothing to
 * talk to — but S3_LOCAL_DISK is the opt-out for a machine that has the
 * placeholder credentials rather than real ones. Nothing sets it in production,
 * so deployed behaviour is exactly what it was.
 */
const useR2 = Boolean(process.env.S3_BUCKET) && process.env.S3_LOCAL_DISK !== 'true'

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['posts'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    collections: ['posts'],
    uploadsCollection: 'media',
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),

  /**
   * Cloudflare R2 storage.
   *
   * Always in the array, never conditionally spread. Calling the plugin is what
   * registers its client upload handler in `admin.dependencies`, and the plugin
   * does that before it looks at `enabled` — deliberately, "to avoid import map
   * discrepancies between dev and prod". An environment that skipped the plugin
   * regenerated importMap.js without that entry, and that is what blanked the
   * live admin. `enabled` decides whether files go to R2; whether the plugin is
   * *loaded* is no longer an environment's decision.
   *
   * `alwaysInsertFields` keeps `url` and `prefix` on media even when disabled,
   * so every environment has the same schema and a dev-mode Drizzle push never
   * proposes dropping a column (which prompts on stdin, and hangs the dev
   * server waiting for an answer nobody can see).
   *
   * Disabled, Payload keeps serving uploads from public/media through its own
   * static handler — the local-dev setup, since R2 credentials are not local.
   */
  s3Storage({
    enabled: useR2,
    alwaysInsertFields: true,
    collections: {
      media: {
        prefix: 'media',
        generateFileURL: ({ filename, prefix }) => {
          const base = (process.env.S3_PUBLIC_URL || '').replace(/\/$/, '')
          return `${base}/${prefix ? `${prefix}/` : ''}${filename}`
        },
      },
    },
    bucket: process.env.S3_BUCKET || '',
    config: {
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      },
      region: 'auto',
      endpoint: process.env.S3_ENDPOINT || '',
    },
  }),
]
