import { Flame } from 'lucide-react'
import type { Metadata } from 'next'
import React from 'react'

import { Aside } from '@/components/layout/aside/Aside'
import { PostListShell } from '@/components/posts/PostListShell'
import { buildCategoryTabs, getArchiveData } from '@/utilities/getArchiveData'
import { getHotPosts } from '@/utilities/getAsideData'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getSiteStats } from '@/utilities/getSiteStats'

export const metadata: Metadata = {
  title: '热门',
}

export const revalidate = 600

export default async function HotsPage() {
  const [{ all, posts }, stats, settings, hotPosts] = await Promise.all([
    getArchiveData({ kind: 'hot' }),
    getSiteStats(),
    getCachedGlobal('site-settings', 1)(),
    getHotPosts(5),
  ])

  const tabs = [
    { href: '/posts', label: '全部' },
    { active: true, href: '/hots', label: '热门' },
    ...buildCategoryTabs(all),
  ]

  return (
    <PostListShell
      aside={<Aside hot={hotPosts} settings={settings} stats={stats} variant="posts-list" />}
      count={posts.length}
      icon={Flame}
      moreHref="/categories"
      pathKey="hots"
      posts={posts}
      subtitle="按浏览量排序，看看大家都在读什么。"
      tabs={tabs}
      title="热门"
    />
  )
}
