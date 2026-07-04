import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'
import siteConfig from '@/config/site'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: siteConfig.seo.defaultDescription,
  images: [
    {
      url: `${getServerSideURL()}${siteConfig.seo.defaultOgImage}`,
    },
  ],
  siteName: siteConfig.name,
  title: siteConfig.seo.defaultTitle,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
