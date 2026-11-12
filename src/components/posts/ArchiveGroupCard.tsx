import Link from 'next/link'
import React from 'react'

type Props = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  count: number
  href: string
  posts: { title: string; slug: string }[]
  /** wide：分类总览，横向铺满、右侧两列文章；compact：标签总览，两列网格、右侧单列 */
  variant?: 'wide' | 'compact'
}

const PostLinks: React.FC<{
  posts: { title: string; slug: string }[]
  columns: 1 | 2
}> = ({ posts, columns }) => {
  if (posts.length === 0) {
    return <p className="flex flex-1 items-center text-[13px] text-slate-400">暂无文章</p>
  }

  return (
    <ul
      className={
        columns === 2
          ? 'grid flex-1 gap-x-6 gap-y-1 sm:grid-cols-2'
          : 'flex flex-1 flex-col justify-center gap-1.5'
      }
    >
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            className="flex items-start gap-2 text-[14px] leading-relaxed text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-sky-300"
            href={`/posts/${post.slug}`}
          >
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span className="line-clamp-1">{post.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export const ArchiveGroupCard: React.FC<Props> = ({
  icon: Icon,
  title,
  count,
  href,
  posts,
  variant = 'wide',
}) => {
  if (variant === 'compact') {
    return (
      <div className="glass-card flex h-full gap-3 rounded-2xl p-3">
        <Link
          className="flex w-24 shrink-0 flex-col items-center justify-center gap-2 rounded-xl bg-slate-900/[0.04] px-2 py-3 text-center transition-colors hover:bg-indigo-500/10 dark:bg-white/[0.06] dark:hover:bg-sky-400/10"
          href={href}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-sky-400/10 dark:text-sky-300">
            <Icon className="h-4 w-4" />
          </span>
          <span className="line-clamp-2 font-serif text-[13px] leading-tight font-bold text-slate-800 dark:text-slate-50">
            {title}
          </span>
          <span className="text-[11px] text-slate-400">{count} 篇</span>
        </Link>

        <PostLinks columns={1} posts={posts} />
      </div>
    )
  }

  return (
    <div className="glass-card flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:gap-5">
      <Link
        className="flex w-full shrink-0 items-center gap-3 rounded-xl bg-slate-900/[0.04] px-3 py-2.5 transition-colors hover:bg-indigo-500/10 sm:w-44 dark:bg-white/[0.06] dark:hover:bg-sky-400/10"
        href={href}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-sky-400/10 dark:text-sky-300">
          <Icon className="h-4 w-4" />
        </span>

        <span className="min-w-0">
          <span className="block truncate font-serif text-[15px] font-bold text-slate-800 dark:text-slate-50">
            {title}
          </span>
          <span className="text-xs text-slate-400">{count} 篇</span>
        </span>
      </Link>

      <PostLinks columns={2} posts={posts} />
    </div>
  )
}
