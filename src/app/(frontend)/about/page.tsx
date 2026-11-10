import type { Metadata } from 'next'
import React from 'react'

import { getCachedGlobal } from '@/utilities/getGlobals'

export const metadata: Metadata = {
  title: '关于',
}

export default async function AboutPage() {
  const settings = await getCachedGlobal('site-settings', 1)()

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="glass-card rounded-3xl p-8 md:p-12">
        <h1 className="font-serif text-3xl font-bold text-slate-800 dark:text-slate-50">关于</h1>

        <p className="mt-5 text-sm leading-relaxed text-slate-600 md:text-base dark:text-slate-300">
          {settings?.bio || '这里将放置关于我的一切。'}
        </p>

        <div className="mt-10 rounded-2xl border border-dashed border-white/40 bg-white/20 p-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
          关于页内容待补充
        </div>
      </div>
    </section>
  )
}
