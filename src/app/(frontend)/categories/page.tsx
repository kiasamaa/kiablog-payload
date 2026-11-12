import { FileText, FolderOpen, Tag } from 'lucide-react'
import type { Metadata } from 'next'
import React from 'react'

import { ArchiveGroupCard } from '@/components/posts/ArchiveGroupCard'
import { ArchiveStats } from '@/components/posts/ArchiveStats'
import { getCategoryGroups } from '@/utilities/getArchiveData'
import { getSiteStats } from '@/utilities/getSiteStats'

export const metadata: Metadata = {
  title: '分类',
}

export const revalidate = 600

export default async function CategoriesPage() {
  const [groups, stats] = await Promise.all([getCategoryGroups(6), getSiteStats()])

  return (
    <section className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 md:pt-12 lg:px-8">
      <header className="mb-6">
        <h1 className="font-serif text-[26px] leading-tight font-bold text-slate-800 md:text-[32px] dark:text-slate-50">
          查看不同领域的 {groups.length} 个分类。
        </h1>

        <div className="mt-5">
          <ArchiveStats
            items={[
              { href: '/posts', icon: FileText, label: '文章', value: stats.posts },
              { href: '/categories', icon: FolderOpen, label: '分类', value: stats.categories },
              { href: '/tags', icon: Tag, label: '标签', value: stats.tags },
            ]}
          />
        </div>
      </header>

      {groups.length === 0 ? (
        <p className="text-[15px] text-slate-500 dark:text-slate-400">还没有任何分类。</p>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <ArchiveGroupCard
              count={group.count}
              href={`/categories/${group.slug}`}
              icon={FolderOpen}
              key={group.id}
              posts={group.posts}
              title={group.title}
            />
          ))}
        </div>
      )}
    </section>
  )
}
