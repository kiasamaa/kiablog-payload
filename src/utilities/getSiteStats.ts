import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

export type TagStat = {
  name: string
  count: number
}

export type SiteStats = {
  posts: number
  categories: number
  tags: number
  words: number
  since: string
  updated: string
  tagStats: TagStat[]
}

const computeSiteStats = async (): Promise<SiteStats> => {
  const payload = await getPayload({ config: configPromise })

  const [posts, categories, settings] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: {
        tags: true,
        wordCount: true,
        publishedAt: true,
      },
      where: {
        _status: {
          equals: 'published',
        },
      },
    }),
    payload.find({
      collection: 'categories',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      pagination: false,
      select: {
        title: true,
      },
    }),
    payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
    }),
  ])

  const tagMap = new Map<string, number>()
  let words = 0
  let updated = ''

  posts.docs.forEach((post) => {
    words += post.wordCount || 0

    const publishedAt = post.publishedAt ? new Date(post.publishedAt).toISOString() : ''

    if (publishedAt && publishedAt > updated) {
      updated = publishedAt
    }

    const tags = (post.tags ?? []) as { tag?: string | null }[]

    tags.forEach((item) => {
      const name = typeof item === 'string' ? item : item?.tag

      if (!name) return

      tagMap.set(name, (tagMap.get(name) || 0) + 1)
    })
  })

  const tagStats = Array.from(tagMap, ([name, count]) => ({ count, name })).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  )

  return {
    categories: categories.docs.length,
    posts: posts.docs.length,
    since: settings?.siteStartedAt || '2025-02-28T00:00:00.000Z',
    tagStats,
    tags: tagStats.length,
    updated,
    words,
  }
}

/**
 * 生产环境按 tag 缓存；开发环境直接查库，避免后台改完数据前台不更新。
 */
export const getSiteStats = (): Promise<SiteStats> => {
  if (process.env.NODE_ENV === 'development') {
    return computeSiteStats()
  }

  return unstable_cache(computeSiteStats, ['site-stats'], {
    tags: ['site-stats'],
  })()
}


