import { FolderOpen } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { Aside } from '@/components/layout/aside/Aside'
import { PostListShell } from '@/components/posts/PostListShell'
import {
  buildCategoryTabs,
  findCategoryBySlug,
  getArchiveData,
} from '@/utilities/getArchiveData'
import { getHotPosts } from '@/utilities/getAsideData'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getSiteStats } from '@/utilities/getSiteStats'

export const revalidate = 600

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function CategoryPage({ params }: Args) {
  const { slug = '' } = await params
  const decodedSlug = decodeURIComponent(slug)
  const category = await findCategoryBySlug(decodedSlug)

  if (!category) notFound()

  const [{ all, posts }, stats, settings, hotPosts] = await Promise.all([
    getArchiveData({ kind: 'category', slug: decodedSlug }),
    getSiteStats(),
    getCachedGlobal('site-settings', 1)(),
    getHotPosts(5),
  ])

  const tabs = [
    { href: '/posts', label: '全部' },
    { href: '/hots', label: '热门' },
    ...buildCategoryTabs(all, decodedSlug),
  ]

  return (
    <PostListShell
      aside={<Aside hot={hotPosts} settings={settings} stats={stats} variant="posts-list" />}
      count={posts.length}
      emptyText="这个分类下还没有文章"
      icon={FolderOpen}
      moreHref="/categories"
      pathKey={`category-${decodedSlug}`}
      posts={posts}
      subtitle={category.description || '该分类下的全部文章。'}
      tabs={tabs}
      title={category.title}
    />
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = '' } = await params
  const category = await findCategoryBySlug(decodeURIComponent(slug))

  return {
    title: category ? category.title : '分类',
  }
}
