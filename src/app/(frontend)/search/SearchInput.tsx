'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export const SearchInput: React.FC<{ initial?: string }> = ({ initial = '' }) => {
  const [value, setValue] = useState(initial)
  const router = useRouter()

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const keyword = value.trim()

    router.push(keyword ? `/search?q=${encodeURIComponent(keyword)}` : '/search')
  }

  return (
    <form className="glass-card flex items-center gap-2 rounded-2xl px-4" onSubmit={onSubmit}>
      <Search className="h-4 w-4 shrink-0 text-slate-400" />

      <input
        aria-label="搜索文章"
        className="h-12 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
        onChange={(event) => setValue(event.target.value)}
        placeholder="搜索文章标题、摘要或标签"
        value={value}
      />

      <button
        className="rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-indigo-500/25 transition-transform hover:-translate-y-0.5"
        type="submit"
      >
        搜索
      </button>
    </form>
  )
}
