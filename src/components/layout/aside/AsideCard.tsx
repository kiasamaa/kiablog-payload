import Link from 'next/link'
import React from 'react'

type Props = {
  title?: string
  icon?: React.ComponentType<{ className?: string }>
  moreHref?: string
  moreLabel?: string
  children: React.ReactNode
}

export const AsideCard: React.FC<Props> = ({
  title,
  icon: Icon,
  moreHref,
  moreLabel = '更多',
  children,
}) => (
  <section className="rounded-2xl border border-slate-900/[0.06] bg-white/85 p-4 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900/80 dark:shadow-black/20">
    {title ? (
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold text-slate-800 dark:text-slate-100">
          {Icon ? <Icon className="h-4 w-4 text-indigo-500 dark:text-sky-300" /> : null}
          {title}
        </h3>

        {moreHref ? (
          <Link
            className="flex items-center gap-0.5 text-[13px] text-slate-400 transition-colors hover:text-indigo-500 dark:hover:text-sky-300"
            href={moreHref}
          >
            {moreLabel}
            <span aria-hidden>›</span>
          </Link>
        ) : null}
      </div>
    ) : null}

    {children}
  </section>
)
