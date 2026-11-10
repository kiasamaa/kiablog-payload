import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import type { Plugin } from 'payload'

import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import type { Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post> = ({ doc }) =>
  doc?.title ? `${doc.title} | Kira Blog` : 'Kira Blog'

const generateURL: GenerateURL<Post> = ({ doc }) =>
  doc?.slug ? `${getServerSideURL()}/posts/${doc.slug}` : getServerSideURL()

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['posts'],
    overrides: {
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  seoPlugin({
    collections: ['posts'],
    generateTitle,
    generateURL,
    uploadsCollection: 'media',
  }),
]
