import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center px-4 py-16">
      <div className="glass-card w-full rounded-3xl p-10 text-center">
        <p className="bg-gradient-to-r from-indigo-500 to-sky-400 bg-clip-text font-serif text-6xl font-bold text-transparent">
          404
        </p>

        <h1 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-100">
          页面走丢了
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          你访问的地址不存在，或者内容已经被移动。
        </p>

        <Link
          className="glass-button mt-8 inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-slate-700 dark:text-slate-200"
          href="/"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Link>
      </div>
    </div>
  )
}
