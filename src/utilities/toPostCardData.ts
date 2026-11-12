import type { PostCardData } from '@/components/posts/PostCard'
import type { Post } from '@/payload-types'

import { formatDate } from './formatDate'
import { getMediaUrl } from './getMediaUrl'

export const toPostCardData = (post: Post): PostCardData => {
  const cover = post.cover && typeof post.cover === 'object' ? post.cover : null
  const category = post.category && typeof post.category === 'object' ? post.category : null

  return {
    categorySlug: category?.slug ?? null,
    categoryTitle: category?.title ?? null,
    coverUrl: post.coverUrl || (cover ? getMediaUrl(cover.sizes?.medium?.url || cover.url) : null),
    description: post.description,
    id: post.id,
    isPinned: post.isPinned,
    publishedAtLabel: formatDate(post.publishedAt),
    readingTime: post.readingTime,
    slug: post.slug,
    tags: post.tags?.map((tag) => tag.tag) ?? [],
    title: post.title,
    views: post.views,
  }
}
