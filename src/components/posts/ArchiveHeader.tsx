import Link from 'next/link'
import React from 'react'

import { cn } from '@/utilities/ui'

export type ArchiveTab = {
  label: string
  href: string
  active?: boolean
  icon?: React.ComponentType<{ className?: string }>
}

type Props = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle?: string
  count?: number
  tabs: ArchiveTab[]
  moreHref?: string
  moreLabel?: string
}

export const ArchiveHeader: React.FC<Props> = ({
  icon: Icon,
  title,
  subtitle,
  count,
  tabs,
  moreHref,
  moreLabel = '更多',
}) => (
  <header className="mb-6">
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      <Icon className="h-5 w-5 text-sky-500 md:h-7 md:w-7" />
      <h1 className="font-serif text-[26px] leading-tight font-bold text-slate-800 md:text-[32px] dark:text-slate-50">
        {title}
      </h1>
      {typeof count === 'number' ? (
        <span className="rounded-full bg-white/50 px-2.5 py-1 text-[13px] text-slate-500 dark:bg-white/10 dark:text-slate-400">
          {count} 篇
        </span>
      ) : null}
    </div>

    {subtitle ? (
      <p className="mt-2 ml-7 text-[15px] text-slate-500 md:ml-10 dark:text-slate-400">{subtitle}</p>
    ) : null}

    <div className="mt-5 flex items-center gap-3">
      <nav
        aria-label="文章分类页签"
        className="-my-2 flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab) => (
          <Link
            aria-current={tab.active ? 'page' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all md:text-[13px]',
              tab.active
                ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/25'
                : 'glass-button text-slate-600 dark:text-slate-300',
            )}
            href={tab.href}
            key={`${tab.href}-${tab.label}`}
          >
            {tab.icon ? <tab.icon className="h-3.5 w-3.5" /> : null}
            {tab.label}
          </Link>
        ))}
      </nav>

      {moreHref ? (
        <Link
          className="shrink-0 text-xs text-slate-400 transition-colors hover:text-indigo-500 md:text-[13px] dark:hover:text-sky-300"
          href={moreHref}
        >
          {moreLabel} »
        </Link>
      ) : null}
    </div>
  </header>
)
