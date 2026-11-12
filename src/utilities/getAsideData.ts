import configPromise from '@payload-config'
import { getPayload } from 'payload'

export type AsidePostItem = {
  id: number
  title: string
  slug: string
  publishedAt: string
}

export type SeriesAsideData = {
  series: string
  posts: AsidePostItem[]
}

const toAsidePost = (post: {
  id: number
  title: string
  slug: string
  publishedAt?: string | null
}): AsidePostItem => ({
  id: post.id,
  publishedAt: post.publishedAt || '',
  slug: post.slug,
  title: post.title,
})

/** 侧边栏「最新文章」 */
export const getRecentPosts = async (limit = 5): Promise<AsidePostItem[]> => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    depth: 0,
    limit,
    overrideAccess: false,
    pagination: false,
    sort: '-publishedAt',
    select: {
      publishedAt: true,
      slug: true,
      title: true,
    },
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return result.docs.map(toAsidePost)
}

/** 侧边栏「热门文章」，按浏览量降序 */
export const getHotPosts = async (limit = 5): Promise<AsidePostItem[]> => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    depth: 0,
    limit,
    overrideAccess: false,
    pagination: false,
    sort: ['-views', '-publishedAt'],
    select: {
      publishedAt: true,
      slug: true,
      title: true,
    },
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return result.docs.map(toAsidePost)
}

/** 侧边栏「系列文章」，没有系列时返回 null */
export const getSeriesPosts = async (
  series?: string | null,
): Promise<SeriesAsideData | null> => {
  if (!series) return null

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 50,
    overrideAccess: false,
    pagination: false,
    sort: 'publishedAt',
    select: {
      publishedAt: true,
      slug: true,
      title: true,
    },
    where: {
      and: [
        { series: { equals: series } },
        {
          _status: {
            equals: 'published',
          },
        },
      ],
    },
  })

  if (result.docs.length < 2) return null

  return {
    posts: result.docs.map(toAsidePost),
    series,
  }
}
