import { Tag } from 'lucide-react'
import type { Metadata } from 'next'
import React from 'react'

import { Aside } from '@/components/layout/aside/Aside'
import { PostListShell } from '@/components/posts/PostListShell'
import { buildTagTabs, getArchiveData } from '@/utilities/getArchiveData'
import { getHotPosts } from '@/utilities/getAsideData'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getSiteStats } from '@/utilities/getSiteStats'

export const revalidate = 600

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function TagPage({ params }: Args) {
  const { slug = '' } = await params
  const tag = decodeURIComponent(slug)

  const [{ all, posts }, stats, settings, hotPosts] = await Promise.all([
    getArchiveData({ kind: 'tag', slug: tag }),
    getSiteStats(),
    getCachedGlobal('site-settings', 1)(),
    getHotPosts(5),
  ])

  const tabs = [
    { href: '/posts', label: '全部' },
    { href: '/hots', label: '热门' },
    ...buildTagTabs(all, tag),
  ]

  return (
    <PostListShell
      aside={<Aside hot={hotPosts} settings={settings} stats={stats} variant="posts-list" />}
      count={posts.length}
      emptyText="这个标签下还没有文章"
      icon={Tag}
      moreHref="/tags"
      pathKey={`tag-${tag}`}
      posts={posts}
      subtitle="带有该标签的全部文章。"
      tabs={tabs}
      title={`#${tag}`}
    />
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = '' } = await params

  return {
    title: `#${decodeURIComponent(slug)}`,
  }
}
