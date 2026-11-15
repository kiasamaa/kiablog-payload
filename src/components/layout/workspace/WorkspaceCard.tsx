import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { cn } from '@/utilities/ui'

type Props = {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  moreHref?: string
  className?: string
  bodyClassName?: string
  children: React.ReactNode
}

/** 工作台里所有独立卡片的基底，保证欢迎条、卡片、骨架屏视觉一致 */
export const WORKSPACE_SURFACE =
  'rounded-3xl border border-white/60 bg-white/80 shadow-[0_30px_70px_-45px_rgba(15,23,42,0.55)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/50'

export const WorkspaceCard: React.FC<Props> = ({
  title,
  icon: Icon,
  moreHref,
  className,
  bodyClassName,
  children,
}) => (
  <section className={cn('flex min-h-0 flex-col p-4', WORKSPACE_SURFACE, className)}>
    <div className="mb-2.5 flex flex-none items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 text-[14px] font-semibold text-slate-800 dark:text-slate-100">
        {Icon ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900/[0.05] dark:bg-white/[0.06]">
            <Icon className="h-4 w-4 text-indigo-500 dark:text-sky-300" />
          </span>
        ) : null}
        {title}
      </h3>

      {moreHref ? (
        <Link
          aria-label={`查看${title}`}
          className="flex items-center gap-0.5 text-[12px] text-slate-400 transition-colors hover:text-indigo-500 dark:hover:text-sky-300"
          href={moreHref}
        >
          更多
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>

    <div className={cn('min-h-0 flex-1', bodyClassName)}>{children}</div>
  </section>
)
