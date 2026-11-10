import { ArrowRight, Camera } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { getCachedGlobal } from '@/utilities/getGlobals'

export const metadata: Metadata = {
  title: '首页',
}

export default async function HomePage() {
  const settings = await getCachedGlobal('site-settings', 1)()
  const siteTitle = settings?.siteTitle || 'Kira Blog'
  const bio = settings?.bio || '在这里记录技术、生活与那些值得被记住的瞬间。'

  return (
    <section className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="glass-card w-full rounded-3xl p-8 md:p-14">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-indigo-500 dark:text-sky-300">
          Welcome
        </p>

        <h1 className="mt-5 font-serif text-3xl leading-tight font-bold text-slate-800 md:text-5xl dark:text-slate-50">
          {siteTitle}
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base dark:text-slate-300">
          {bio}
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-500 to-sky-500 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-transform hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30"
            href="/posts"
          >
            浏览文章
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            className="glass-button inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-slate-700 dark:text-slate-200"
            href="/photowall"
          >
            <Camera className="h-4 w-4" />
            看看照片
          </Link>
        </div>
      </div>
    </section>
  )
}
