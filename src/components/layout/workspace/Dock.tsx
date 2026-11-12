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
  <div className="flex items-center justify-center gap-2">
    {actions.map((action) => (
      <motion.button
        aria-label={action.label}
        className={cn(
          'glass-button flex h-10 w-10 items-center justify-center rounded-full text-slate-600 dark:text-slate-300',
          action.active && 'text-indigo-600 dark:text-sky-300',
        )}
        key={action.key}
        onClick={action.onClick}
        title={action.label}
        transition={{ duration: 0.15 }}
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
      >
        <action.icon className="h-4 w-4" />
      </motion.button>
    ))}
  </div>
)
