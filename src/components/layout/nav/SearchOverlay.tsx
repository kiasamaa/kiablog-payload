'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import { getHotkeysEnabled } from '@/utilities/preferences'

type Props = {
  open: boolean
  onClose: () => void
}

export const SearchOverlay: React.FC<Props> = ({ open, onClose }) => {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && getHotkeysEnabled()) onClose()
    }

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    const timer = window.setTimeout(() => inputRef.current?.focus(), 60)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(timer)
    }
  }, [open, onClose])

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const query = keyword.trim()

    if (!query) return

    onClose()
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-950/40 px-4 pt-24 backdrop-blur-sm"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-card w-full max-w-xl rounded-2xl p-2"
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            initial={{ opacity: 0, scale: 0.97, y: -12 }}
            onClick={(event) => event.stopPropagation()}
            onSubmit={onSubmit}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-2 px-3">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />

              <input
                aria-label="搜索文章"
                className="h-12 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索文章标题、摘要或标签，回车确认"
                ref={inputRef}
                value={keyword}
              />

              <button
                aria-label="关闭搜索"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/40 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
