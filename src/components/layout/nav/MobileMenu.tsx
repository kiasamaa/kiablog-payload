'use client'

import { AnimatePresence, motion } from 'motion/react'
import { BookOpen, Camera, Home, Info, X } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import type { NavCategory } from '@/utilities/getNavData'

type Props = {
  open: boolean
  onClose: () => void
  categories: NavCategory[]
}

const basicItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/posts', label: '全部文章', icon: BookOpen },
  { href: '/photowall', label: '壁纸墙', icon: Camera },
  { href: '/about', label: '关于', icon: Info },
]

export const MobileMenu: React.FC<Props> = ({ open, onClose, categories }) => {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden border-t border-white/20 bg-white/85 backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-slate-900/90"
          exit={{ opacity: 0, height: 0 }}
          initial={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="text-[11px] font-medium tracking-[0.3em] text-slate-400 uppercase">
              Menu
            </span>
            <button
              aria-label="关闭菜单"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-300"
              onClick={onClose}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <ul className="flex flex-col gap-1 px-3 pb-4">
            {basicItems.map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <Link
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 hover:bg-white/60 dark:text-slate-200 dark:hover:bg-white/10"
                  href={href}
                  onClick={onClose}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {categories.length > 0 ? (
            <div className="border-t border-white/20 px-3 pb-5 dark:border-white/10">
              <p className="px-3 pt-4 pb-2 text-[11px] font-medium tracking-[0.3em] text-slate-400 uppercase">
                Browse
              </p>

              {categories.map((category) => (
                <div className="mb-2" key={category.id}>
                  <Link
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-white/60 dark:text-slate-200 dark:hover:bg-white/10"
                    href={`/categories/${category.slug}`}
                    onClick={onClose}
                  >
                    {category.title}
                    <span className="text-xs text-slate-400">{category.count}</span>
                  </Link>

                  {category.series.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 px-3 pt-1 pb-2">
                      {category.series.map((series) => (
                        <Link
                          className="rounded-full border border-white/40 bg-white/40 px-2.5 py-1 text-[11px] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                          href={`/categories/${category.slug}?series=${encodeURIComponent(series)}`}
                          key={series}
                          onClick={onClose}
                        >
                          {series}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
