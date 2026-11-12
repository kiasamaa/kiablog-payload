import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { PostCardData } from '@/components/posts/PostCard'

import type { ArchiveTab } from '@/components/posts/ArchiveHeader'
import { toPostCardData } from './toPostCardData'

/** 一次取全部已发布文章，列表页在内存里按分类/标签/热度筛选 */
const getAllPublishedPosts = async (): Promise<PostCardData[]> => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 300,
    overrideAccess: false,
    pagination: false,
    sort: '-publishedAt',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return result.docs.map(toPostCardData)
}

export type ArchiveKind = 'all' | 'hot' | 'category' | 'tag'

export type ArchiveData = {
  /** 全部已发布文章，用于构建页签与统计 */
  all: PostCardData[]
  /** 当前场景下要展示的文章 */
  posts: PostCardData[]
}

export const getArchiveData = async (options: {
  kind: ArchiveKind
  slug?: string
}): Promise<ArchiveData> => {
  const all = await getAllPublishedPosts()
  let posts = all

  if (options.kind === 'category' && options.slug) {
    posts = all.filter((post) => post.categorySlug === options.slug)
  }

  if (options.kind === 'tag' && options.slug) {
    posts = all.filter((post) => post.tags?.includes(options.slug as string))
  }

  if (options.kind === 'hot') {
    posts = [...posts].sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
  }

  return { all, posts }
}

/** 分类页签：按文章数从多到少 */
export const buildCategoryTabs = (
  posts: PostCardData[],
  activeSlug?: string,
): ArchiveTab[] => {
  const map = new Map<string, { label: string; count: number }>()

  posts.forEach((post) => {
    if (!post.categorySlug || !post.categoryTitle) return

    const current = map.get(post.categorySlug) ?? { count: 0, label: post.categoryTitle }
    current.count += 1
    map.set(post.categorySlug, current)
  })

  return Array.from(map, ([slug, item]) => ({
    active: slug === activeSlug,
    count: item.count,
    href: `/categories/${slug}`,
    label: item.label,
  })).sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
}

/** 标签页签：按出现次数从多到少 */
export const buildTagTabs = (posts: PostCardData[], activeTag?: string): ArchiveTab[] => {
  const map = new Map<string, number>()

  posts.forEach((post) => {
    post.tags?.forEach((tag) => {
      if (!tag) return
      map.set(tag, (map.get(tag) ?? 0) + 1)
    })
  })

  return Array.from(map, ([name, count]) => ({
    active: name === activeTag,
    count,
    href: `/tags/${encodeURIComponent(name)}`,
    label: `#${name}`,
  })).sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
}

export const findCategoryBySlug = async (slug: string) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  return result.docs[0] || null
}

export type CategoryGroup = {
  id: number
  title: string
  slug: string
  count: number
  posts: { title: string; slug: string }[]
}

/** 分类总览：全部分类 + 每个分类下最近的若干篇 */
export const getCategoryGroups = async (postsPerCategory = 6): Promise<CategoryGroup[]> => {
  const payload = await getPayload({ config: configPromise })

  const [categories, all] = await Promise.all([
    payload.find({
      collection: 'categories',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      pagination: false,
      sort: 'sort',
      select: { title: true, slug: true },
    }),
    getAllPublishedPosts(),
  ])

  return categories.docs
    .map((category) => {
      const matched = all.filter((post) => post.categorySlug === category.slug)

      return {
        count: matched.length,
        id: category.id,
        posts: matched.slice(0, postsPerCategory).map((post) => ({
          slug: post.slug,
          title: post.title,
        })),
        slug: category.slug,
        title: category.title,
      }
    })
    .sort((a, b) => b.count - a.count)
}
