'use client'

import { motion } from 'motion/react'
import React from 'react'

import { cn } from '@/utilities/ui'

export type DockAction = {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
  onClick: () => void
}

type Props = {
  actions: DockAction[]
}

export const Dock: React.FC<Props> = ({ actions }) => (
  <div className="flex flex-wrap items-center justify-center gap-2.5">
    {actions.map((action) => {
      const Icon = action.icon

      return (
        <motion.button
          aria-label={action.label}
          aria-pressed={action.active === undefined ? undefined : action.active}
          className={cn(
            'group relative flex h-10 w-10 items-center justify-center rounded-full border outline-none select-none',
            'focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
            action.active
              ? 'border-transparent bg-gradient-to-br from-indigo-500 via-blue-500 to-sky-400 text-white shadow-lg shadow-indigo-500/35'
              : 'border-white/60 bg-white/80 text-slate-600 shadow-[0_10px_26px_-16px_rgba(15,23,42,0.55)] hover:border-indigo-300/70 hover:text-indigo-600 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-sky-400/40 dark:hover:text-sky-300',
          )}
          key={action.key}
          onClick={action.onClick}
          transition={{ damping: 26, stiffness: 420, type: 'spring' }}
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.94, y: -1 }}
        >
          <Icon className="h-[17px] w-[17px]" />

          <span
            aria-hidden
            className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 translate-y-1 rounded-lg bg-slate-900/90 px-2 py-1 text-[11px] font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 dark:bg-slate-700/95"
          >
            {action.label}
          </span>
        </motion.button>
      )
    })}
  </div>
)
