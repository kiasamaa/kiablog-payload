import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import React from 'react'

import type { PostCardData } from '@/components/posts/PostCard'
import { formatDate } from '@/utilities/formatDate'
import { getMediaUrl } from '@/utilities/getMediaUrl'

import { PostsClient, type CategoryFilter } from './PostsClient'

export const metadata: Metadata = {
  title: '文章',
}

export const revalidate = 600

export default async function PostsPage() {
  const payload = await getPayload({ config: configPromise })

  const [postsResult, categoriesResult] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 100,
      overrideAccess: false,
      pagination: false,
      sort: '-publishedAt',
      where: {
        _status: {
          equals: 'published',
        },
      },
      select: {
        title: true,
        slug: true,
        description: true,
        cover: true,
        category: true,
        tags: true,
        isPinned: true,
        views: true,
        readingTime: true,
        publishedAt: true,
      },
    }),
    payload.find({
      collection: 'categories',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      pagination: false,
      sort: 'sort',
      select: {
        title: true,
        slug: true,
      },
    }),
  ])

  const posts: PostCardData[] = postsResult.docs.map((post) => {
    const cover = post.cover
    const category = post.category

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      description: post.description,
      coverUrl:
        cover && typeof cover === 'object'
          ? getMediaUrl(cover.sizes?.medium?.url || cover.url)
          : null,
      categoryTitle: category && typeof category === 'object' ? category.title : null,
      categorySlug: category && typeof category === 'object' ? category.slug : null,
      tags: post.tags?.map((tag) => tag.tag) ?? [],
      isPinned: post.isPinned,
      views: post.views,
      readingTime: post.readingTime,
      publishedAtLabel: formatDate(post.publishedAt),
    }
  })

  const categories: CategoryFilter[] = categoriesResult.docs.map((category) => ({
    id: category.id,
    title: category.title,
    slug: category.slug,
  }))

  return <PostsClient categories={categories} posts={posts} />
}
