'use client'

import { AnimatePresence, motion } from 'motion/react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/utilities/ui'

type Props = {
  label: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
  width?: string
  iconOnly?: boolean
  title?: string
}

/**
 * 通用下拉面板：悬浮打开、延迟 100ms 关闭（避免鼠标穿过缝隙时闪断），
 * 点击外部与 Esc 关闭。面板是触发器的子节点，mouseleave 会包含后代元素。
 */
export const NavDropdown: React.FC<Props> = ({
  label,
  children,
  align = 'left',
  width = 'w-64',
  iconOnly = false,
  title,
}) => {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const clearTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const onEnter = useCallback(() => {
    clearTimer()
    setOpen(true)
  }, [clearTimer])

  const onLeave = useCallback(() => {
    clearTimer()
    closeTimer.current = setTimeout(() => setOpen(false), 100)
  }, [clearTimer])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => clearTimer, [clearTimer])

  return (
    <div className="relative" onMouseEnter={onEnter} onMouseLeave={onLeave} ref={rootRef}>
      <button
        aria-expanded={open}
        aria-label={title}
        className={cn(
          'flex h-9 items-center rounded-xl text-sm font-medium transition-colors',
          iconOnly ? 'w-9 justify-center' : 'gap-1 px-3',
          open
            ? 'bg-white/50 text-slate-900 dark:bg-white/10 dark:text-white'
            : 'text-slate-600 hover:bg-white/40 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white',
        )}
        onClick={() => setOpen((value) => !value)}
        title={title}
        type="button"
      >
        {label}

        {iconOnly ? null : (
          <motion.svg
            animate={{ rotate: open ? 180 : 0 }}
            className="h-3 w-3 opacity-60"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            transition={{ duration: 0.2 }}
            viewBox="0 0 24 24"
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={cn('absolute top-full z-50 pt-2', align === 'right' ? 'right-0' : 'left-0', width)}
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="overflow-hidden rounded-2xl border border-slate-900/[0.06] bg-white/95 p-2 shadow-xl shadow-slate-900/15 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/95 dark:shadow-black/40">
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
