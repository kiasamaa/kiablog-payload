import configPromise from '@payload-config'
import { Search as SearchIcon } from 'lucide-react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import React from 'react'

import { PostCard } from '@/components/posts/PostCard'
import { toPostCardData } from '@/utilities/toPostCardData'

import { SearchInput } from './SearchInput'

export const metadata: Metadata = {
  title: '搜索',
}

type Args = {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Args) {
  const { q = '' } = await searchParams
  const keyword = q.trim()

  const payload = await getPayload({ config: configPromise })

  // 关键词为空时返回全部已发布文章，而不是空结果
  const results = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 30,
    overrideAccess: false,
    pagination: false,
    sort: '-publishedAt',
    where: keyword
      ? {
          and: [
            { _status: { equals: 'published' } },
            {
              or: [
                { title: { like: keyword } },
                { description: { like: keyword } },
                { 'tags.tag': { like: keyword } },
              ],
            },
          ],
        }
      : { _status: { equals: 'published' } },
  })

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <header className="mb-8 md:mb-10">
        <div className="flex items-center gap-2 md:gap-3">
          <SearchIcon className="h-5 w-5 text-sky-500 md:h-7 md:w-7" />
          <h1 className="font-serif text-2xl font-bold text-slate-800 md:text-3xl dark:text-slate-50">
            搜索
          </h1>
        </div>

        <p className="mt-2 ml-7 text-sm text-slate-500 md:ml-10 dark:text-slate-400">
          在标题、摘要与标签中查找内容。
        </p>
      </header>

      <div className="mb-8">
        <SearchInput initial={keyword} />
      </div>

      {results.docs.length > 0 ? (
        <>
          <p className="mb-5 text-xs text-slate-500 dark:text-slate-400">
            {keyword ? `关于「${keyword}」的结果：${results.docs.length} 篇` : `全部文章：${results.docs.length} 篇`}
          </p>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.docs.map((post, index) => (
              <PostCard index={index} key={post.id} post={toPostCardData(post)} />
            ))}
          </div>
        </>
      ) : (
        <div className="glass-card flex flex-col items-center justify-center rounded-3xl px-6 py-24 text-slate-500 dark:text-slate-400">
          <SearchIcon className="mb-4 h-12 w-12 opacity-40" />
          <p className="text-sm">没有找到与「{keyword}」相关的内容</p>
        </div>
      )}
    </section>
  )
}
