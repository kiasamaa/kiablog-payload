'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Loader2 } from 'lucide-react'
import React, { useMemo, useState } from 'react'

import { PostCard, type PostCardData } from '@/components/posts/PostCard'
import { cn } from '@/utilities/ui'

const PAGE_SIZE = 12

export type CategoryFilter = {
  id: number
  title: string
  slug: string
}

type Props = {
  posts: PostCardData[]
  categories: CategoryFilter[]
}

const sortPosts = (posts: PostCardData[]) =>
  [...posts].sort((a, b) => {
    if (Boolean(a.isPinned) !== Boolean(b.isPinned)) return a.isPinned ? -1 : 1

    return (b.publishedAtLabel || '').localeCompare(a.publishedAtLabel || '')
  })

export const PostsClient: React.FC<Props> = ({ posts, categories }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filteredPosts = useMemo(() => {
    const sorted = sortPosts(posts)

    return activeCategory ? sorted.filter((post) => post.categorySlug === activeCategory) : sorted
  }, [activeCategory, posts])

  const visiblePosts = filteredPosts.slice(0, visibleCount)
  const hasMore = filteredPosts.length > visibleCount

  const categoryCount = (slug: string) => posts.filter((post) => post.categorySlug === slug).length

  const onSelectCategory = (slug: string | null) => {
    setActiveCategory(slug)
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 md:mb-12"
        initial={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <BookOpen className="h-5 w-5 text-sky-500 md:h-7 md:w-7" />
          <h1 className="font-serif text-2xl font-bold text-slate-800 md:text-3xl dark:text-slate-50">
            文章
          </h1>
        </div>

        <p className="mt-2 ml-7 text-sm text-slate-500 md:ml-10 md:text-base dark:text-slate-400">
          记录技术探索、阅读思考与生活中的片段。
        </p>
      </motion.div>

      <div className="mb-6 flex flex-wrap gap-2 md:mb-9">
        <FilterTab
          active={activeCategory === null}
          count={posts.length}
          label="全部"
          onClick={() => onSelectCategory(null)}
        />

        {categories.map((category) => (
          <FilterTab
            active={activeCategory === category.slug}
            count={categoryCount(category.slug)}
            key={category.id}
            label={category.title}
            onClick={() => onSelectCategory(category.slug)}
          />
        ))}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center rounded-3xl px-6 py-24 text-slate-500 dark:text-slate-400">
          <BookOpen className="mb-4 h-12 w-12 opacity-40" />
          <p className="text-sm">这里还没有文章</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            key={activeCategory ?? 'all'}
          >
            {visiblePosts.map((post, index) => (
              <PostCard index={index} key={post.id} post={post} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

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
    </section>
  )
}

const FilterTab: React.FC<{
  label: string
  count: number
  active: boolean
  onClick: () => void
}> = ({ label, count, active, onClick }) => (
  <button
    className={cn(
      'flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all md:text-sm',
      active
        ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/25'
        : 'glass-button text-slate-600 dark:text-slate-300',
    )}
    onClick={onClick}
    type="button"
  >
    {label}
    <span className={cn('text-[10px]', active ? 'text-white/80' : 'text-slate-400')}>{count}</span>
  </button>
)
