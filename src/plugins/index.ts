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

  // Cloudflare R2 storage — active only when S3_BUCKET is set.
  // Falls back to local storage for local development without R2 credentials.
  ...(process.env.S3_BUCKET
    ? [
        s3Storage({
          collections: {
            media: {
              prefix: 'media',
              generateFileURL: ({ filename, prefix }) => {
                const base = (process.env.S3_PUBLIC_URL || '').replace(/\/$/, '')
                return `${base}/${prefix ? `${prefix}/` : ''}${filename}`
              },
            },
          },
          bucket: process.env.S3_BUCKET,
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
    : []),
]
