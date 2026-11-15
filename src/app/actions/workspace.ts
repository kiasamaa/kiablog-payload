'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { getSiteStats, type SiteStats } from '@/utilities/getSiteStats'
import { getMediaUrl } from '@/utilities/getMediaUrl'

export type WorkspacePost = {
  id: number
  title: string
  slug: string
  publishedAt: string
  views: number
  coverUrl?: string | null
  description?: string | null
  categoryTitle?: string | null
  readingTime?: number | null
}

export type WorkspaceData = {
  recent: WorkspacePost[]
  hot: WorkspacePost[]
  stats: SiteStats
}

const CACHE_TTL = 5 * 60 * 1000

let cache: { data: WorkspaceData; at: number } | null = null

const toWorkspacePost = (post: {
  id: number
  title: string
  slug: string
  publishedAt?: string | null
  views?: number | null
  cover?:
    | null
    | number
    | {
        url?: string | null
        sizes?: null | Record<string, { url?: string | null } | undefined>
      }
  description?: string | null
  category?: null | number | { title?: string | null }
  coverUrl?: string | null
  readingTime?: number | null
}): WorkspacePost => {
  const cover = post.cover && typeof post.cover === 'object' ? post.cover : null
  const category =
    post.category && typeof post.category === 'object' ? post.category.title || null : null

  return {
    categoryTitle: category,
    coverUrl: post.coverUrl || (cover ? getMediaUrl(cover.sizes?.medium?.url || cover.url) : null),
    description: post.description || null,
    id: post.id,
    publishedAt: post.publishedAt || '',
    readingTime: post.readingTime ?? null,
    slug: post.slug,
    title: post.title,
    views: post.views ?? 0,
  }
}

/** 工作台数据：打开时按需拉取，进程内缓存 5 分钟 */
export const getWorkspaceData = async (): Promise<WorkspaceData> => {
  if (cache && Date.now() - cache.at < CACHE_TTL) {
    return cache.data
  }

  const payload = await getPayload({ config: configPromise })

  const [recent, hot, stats] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 9,
      overrideAccess: false,
      pagination: false,
      sort: '-publishedAt',
      select: {
        category: true,
        cover: true,
        coverUrl: true,
        description: true,
        publishedAt: true,
        readingTime: true,
        slug: true,
        title: true,
        views: true,
      },
      where: {
        _status: {
          equals: 'published',
        },
      },
    }),
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 9,
      overrideAccess: false,
      pagination: false,
      sort: ['-views', '-publishedAt'],
      select: {
        category: true,
        cover: true,
        coverUrl: true,
        description: true,
        publishedAt: true,
        readingTime: true,
        slug: true,
        title: true,
        views: true,
      },
      where: {
        _status: {
          equals: 'published',
        },
      },
    }),
    getSiteStats(),
  ])

  const data: WorkspaceData = {
    hot: hot.docs.map(toWorkspacePost),
    recent: recent.docs.map(toWorkspacePost),
    stats,
  }

  cache = { at: Date.now(), data }

  return data
}
