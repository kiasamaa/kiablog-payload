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

export const WorkspaceCard: React.FC<Props> = ({
  title,
  icon: Icon,
  moreHref,
  className,
  children,
}) => (
  <section
    className={cn(
      'rounded-2xl border border-slate-900/[0.06] bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]',
      className,
    )}
  >
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

    {children}
  </section>
)
