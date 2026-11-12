import { BarChart3, Clock3, Flame, Layers, Tags as TagsIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { SiteProfile } from '@/components/site/SiteProfile'
import type { SiteSetting } from '@/payload-types'
import { formatDate, getRunningDays } from '@/utilities/formatDate'
import type { AsidePostItem, SeriesAsideData } from '@/utilities/getAsideData'
import type { SiteStats, TagStat } from '@/utilities/getSiteStats'
import { cn } from '@/utilities/ui'

import { AsideCard } from './AsideCard'

const ITEM_CLASS =
  'flex items-start gap-2 rounded-lg px-2 py-1.5 text-[15px] leading-snug text-slate-600 transition-colors hover:bg-slate-900/[0.04] hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-sky-300'

const INDEX_CLASS = 'w-4 shrink-0 text-[13px] font-mono leading-6'

const formatWords = (words: number) =>
  words >= 10000 ? `${(words / 10000).toFixed(1)} 万` : `${words}`

export const SiteCard: React.FC<{ settings: SiteSetting | null }> = ({ settings }) => (
  <AsideCard>
    <SiteProfile settings={settings} variant="aside" />
  </AsideCard>
)

export const HotPostsCard: React.FC<{ posts: AsidePostItem[] }> = ({ posts }) => (
  <AsideCard icon={Flame} moreHref="/hots" title="热门文章">
    {posts.length === 0 ? (
      <p className="py-2 text-center text-[13px] text-slate-400">暂无数据</p>
    ) : (
      <ol className="space-y-0.5">
        {posts.map((post, index) => (
          <li key={post.id}>
            <Link className={cn(ITEM_CLASS, 'py-2')} href={`/posts/${post.slug}`}>
              <span
                className={cn(
                  INDEX_CLASS,
                  index < 3
                    ? 'text-indigo-500 dark:text-sky-300'
                    : 'text-slate-400 dark:text-slate-500',
                )}
              >
                {index + 1}
              </span>
              <span className="line-clamp-2">{post.title}</span>
            </Link>
          </li>
        ))}
      </ol>
    )}
  </AsideCard>
)

export const TagsCard: React.FC<{ tags: TagStat[] }> = ({ tags }) => (
  <AsideCard icon={TagsIcon} moreHref="/tags" title="标签">
    <div className="flex flex-wrap gap-2">
      {tags.slice(0, 15).map((tag) => (
        <Link
          className="rounded-lg bg-slate-900/[0.05] px-2.5 py-1 text-[13px] text-slate-600 transition-colors hover:bg-indigo-500/12 hover:text-indigo-600 dark:bg-white/[0.07] dark:text-slate-300 dark:hover:bg-sky-400/12 dark:hover:text-sky-300"
          href={`/tags/${encodeURIComponent(tag.name)}`}
          key={tag.name}
        >
          #{tag.name}
          <span className="ml-1 text-slate-400 dark:text-slate-500">{tag.count}</span>
        </Link>
      ))}
    </div>
  </AsideCard>
)

export const StatsCard: React.FC<{ stats: SiteStats }> = ({ stats }) => {
  const rows = [
    { label: '文章总数', value: stats.posts },
    { label: '分类数量', value: stats.categories },
    { label: '标签数量', value: stats.tags },
    { label: '全站字数', value: formatWords(stats.words) },
    { label: '建站天数', value: `${getRunningDays(stats.since)} 天` },
    { label: '最后更新', value: stats.updated ? formatDate(stats.updated) : '—' },
  ]

  return (
    <AsideCard icon={BarChart3} title="网站信息">
      <ul className="space-y-2">
        {rows.map((row) => (
          <li className="flex items-baseline justify-between gap-3" key={row.label}>
            <span className="text-[14px] text-slate-500 dark:text-slate-400">{row.label}</span>
            <span className="text-[15px] font-medium text-slate-700 dark:text-slate-200">
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </AsideCard>
  )
}

export const SeriesCard: React.FC<{ data: SeriesAsideData; currentSlug: string }> = ({
  data,
  currentSlug,
}) => (
  <AsideCard icon={Layers} title={data.series}>
    <ol className="space-y-0.5">
      {data.posts.map((post, index) => {
        const active = post.slug === currentSlug

        return (
          <li key={post.id}>
            <Link
              className={cn(
                ITEM_CLASS,
                active
                  ? 'bg-indigo-500/10 font-medium text-indigo-600 dark:bg-sky-400/10 dark:text-sky-300'
                  : '',
              )}
              href={`/posts/${post.slug}`}
            >
              <span className={cn(INDEX_CLASS, 'opacity-50')}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="line-clamp-2">{post.title}</span>
            </Link>
          </li>
        )
      })}
    </ol>
  </AsideCard>
)

export const RecentCard: React.FC<{ posts: AsidePostItem[] }> = ({ posts }) => (
  <AsideCard icon={Clock3} moreHref="/posts" title="最新文章">
    {posts.length === 0 ? (
      <p className="py-2 text-center text-[13px] text-slate-400">暂无文章</p>
    ) : (
      <ul className="space-y-0.5">
        {posts.map((post) => (
          <li key={post.id}>
            <Link className={cn(ITEM_CLASS, 'items-center justify-between gap-2')} href={`/posts/${post.slug}`}>
              <span className="line-clamp-1">{post.title}</span>
              <span className="shrink-0 text-[13px] text-slate-400">
                {post.publishedAt ? formatDate(post.publishedAt).slice(5) : ''}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    )}
  </AsideCard>
)
