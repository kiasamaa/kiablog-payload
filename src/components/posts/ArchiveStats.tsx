import Link from 'next/link'
import React from 'react'

export type ArchiveStatItem = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  href: string
}

type Props = {
  items: ArchiveStatItem[]
}

export const ArchiveStats: React.FC<Props> = ({ items }) => (
  <div className="flex flex-wrap items-center gap-2">
    {items.map(({ href, icon: Icon, label, value }) => (
      <Link
        className="glass-button flex items-center gap-2 rounded-xl px-3.5 py-2 transition-transform hover:-translate-y-0.5"
        href={href}
        key={label}
      >
        <Icon className="h-4 w-4 text-indigo-500 dark:text-sky-300" />
        <span className="font-serif text-lg leading-none font-bold text-slate-800 dark:text-slate-100">
          {value}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      </Link>
    ))}
  </div>
)
