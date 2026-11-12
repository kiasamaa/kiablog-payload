'use client'

import { BookOpen, Loader2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { PostCard, type PostCardData } from '@/components/posts/PostCard'

const PAGE_SIZE = 12

type Props = {
  posts: PostCardData[]
  emptyText?: string
}

export const PostGrid: React.FC<Props> = ({ posts, emptyText = '这里还没有文章' }) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const pathname = usePathname()

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [pathname])

  if (posts.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center rounded-3xl px-6 py-24 text-slate-500 dark:text-slate-400">
        <BookOpen className="mb-4 h-12 w-12 opacity-40" />
        <p className="text-sm">{emptyText}</p>
      </div>
    )
  }

  const visiblePosts = posts.slice(0, visibleCount)
  const hasMore = posts.length > visibleCount

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePosts.map((post, index) => (
          <PostCard index={index} key={post.id} post={post} />
        ))}
      </div>

      {hasMore ? (
        <div className="mt-10 flex justify-center">
          <button
            className="glass-button flex items-center gap-2 px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-200"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            type="button"
          >
            <Loader2 className="h-4 w-4" />
            加载更多
          </button>
        </div>
      ) : null}
    </>
  )
}
