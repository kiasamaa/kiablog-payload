'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

/** 文章浏览量 +1，由客户端做 12 小时去重后调用 */
export const incrementPostViews = async (slug: string): Promise<void> => {
  if (!slug) return

  const payload = await getPayload({ config: configPromise })

  const found = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
  })

  const post = found.docs[0]

  if (!post) return

  await payload.update({
    collection: 'posts',
    context: { disableRevalidate: true },
    data: {
      views: (post.views || 0) + 1,
    },
    id: post.id,
    overrideAccess: true,
  })
}
