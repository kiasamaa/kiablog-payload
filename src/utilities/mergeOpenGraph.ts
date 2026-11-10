import type { Metadata } from 'next'

import { getServerSideURL } from './getURL'

const SITE_NAME = 'Kira Blog'

type OpenGraph = NonNullable<Metadata['openGraph']>

const getDefaultOpenGraph = (): OpenGraph => ({
  type: 'website',
  description: '一个使用 Payload 与 Next.js 搭建的个人博客。',
  images: [
    {
      url: `${getServerSideURL()}/website-template-OG.webp`,
    },
  ],
  siteName: SITE_NAME,
  title: SITE_NAME,
})

export const mergeOpenGraph = (og?: Metadata['openGraph']): OpenGraph => {
  const defaultOpenGraph = getDefaultOpenGraph()

  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
    siteName: og?.siteName || defaultOpenGraph.siteName,
    title: og?.title || defaultOpenGraph.title,
  }
}
