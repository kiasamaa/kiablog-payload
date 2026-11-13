import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { cn } from '@/utilities/ui'

type Props = {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  moreHref?: string
  className?: string
  children: React.ReactNode
}

/** 工作台里所有独立卡片的基底，保证欢迎条、卡片、骨架屏视觉一致 */
export const WORKSPACE_SURFACE =
  'rounded-2xl border border-white/60 bg-white/85 shadow-[0_20px_50px_-32px_rgba(15,23,42,0.5)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/40'

export const WorkspaceCard: React.FC<Props> = ({
  title,
  icon: Icon,
  moreHref,
  className,
  children,
}) => (
  <section className={cn('flex flex-col p-5', WORKSPACE_SURFACE, className)}>
    <div className="mb-3 flex items-center justify-between gap-2">
      <p className="flex items-center gap-2 text-[15px] font-semibold text-slate-800 dark:text-slate-100">
        {Icon ? <Icon className="h-4 w-4 text-indigo-500 dark:text-sky-300" /> : null}
        {title}
      </p>

      {moreHref ? (
        <Link
          aria-label={`查看${title}`}
          className="flex items-center gap-0.5 text-[13px] text-slate-400 transition-colors hover:text-indigo-500 dark:hover:text-sky-300"
          href={moreHref}
        >
          更多
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>

    <div className="flex-1">{children}</div>
  </section>
)
