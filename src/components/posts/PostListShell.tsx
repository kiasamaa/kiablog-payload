import React from 'react'

import type { PostCardData } from '@/components/posts/PostCard'

import { ArchiveHeader, type ArchiveTab } from './ArchiveHeader'
import { PostGrid } from './PostGrid'

type Props = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle?: string
  count?: number
  tabs: ArchiveTab[]
  moreHref?: string
  posts: PostCardData[]
  aside?: React.ReactNode
  emptyText?: string
  pathKey: string
}

/**
 * 所有「文章列表」页共用的骨架：标题区 + 页签栏跨满整行，
 * 卡片网格与侧栏在下一行，保证侧栏顶部与网格对齐。
 */
export const PostListShell: React.FC<Props> = ({
  icon,
  title,
  subtitle,
  count,
  tabs,
  moreHref,
  posts,
  aside,
  emptyText,
  pathKey,
}) => (
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="grid gap-x-8 xl:grid-cols-[minmax(0,1fr)_auto]">
      <div className="pt-10 md:pt-12 xl:col-span-2">
        <ArchiveHeader
          count={count}
          icon={icon}
          moreHref={moreHref}
          subtitle={subtitle}
          tabs={tabs}
          title={title}
        />
      </div>

      <div className="min-w-0 pb-12">
        <PostGrid emptyText={emptyText} key={pathKey} posts={posts} />
      </div>

      {aside ? <div className="hidden pb-12 xl:block">{aside}</div> : null}
    </div>
  </div>
)
