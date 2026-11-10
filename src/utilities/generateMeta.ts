import type { Metadata } from 'next'

import type { Config, Media, Post } from '../payload-types'

import { getServerSideURL } from './getURL'
import { mergeOpenGraph } from './mergeOpenGraph'

const SITE_NAME = 'Kira Blog'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: { doc: Partial<Post> | null }): Promise<Metadata> => {
  const { doc } = args

  const ogImage = getImageURL(doc?.meta?.image)
  const title = doc?.meta?.title || doc?.title || SITE_NAME
  const description = doc?.meta?.description || doc?.description || undefined

  return {
    description,
    openGraph: mergeOpenGraph({
      description: description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title: title === SITE_NAME ? SITE_NAME : `${title} | ${SITE_NAME}`,
      url: doc?.slug ? `/posts/${doc.slug}` : '/',
    }),
    title,
  }
}
