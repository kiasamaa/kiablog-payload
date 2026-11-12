'use client'

import { AnimatePresence, motion } from 'motion/react'
import {
  Clock3,
  Flame,
  Keyboard,
  Moon,
  PanelRight,
  Sun,
  Tags as TagsIcon,
  X,
} from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import { getWorkspaceData, type WorkspaceData } from '@/app/actions/workspace'
import { useTheme } from '@/components/providers/ThemeProvider'
import { SiteProfile } from '@/components/site/SiteProfile'
import type { SiteSetting } from '@/payload-types'
import { formatDate, getRunningDays } from '@/utilities/formatDate'
import {
  getAsideHidden,
  getHotkeysEnabled,
  setAsideHidden,
  setHotkeysEnabled,
} from '@/utilities/preferences'
import { cn } from '@/utilities/ui'

import { Dock, type DockAction } from './Dock'
import { WorkspaceCard } from './WorkspaceCard'

type Props = {
  open: boolean
  onClose: () => void
  settings: SiteSetting | null
}

const shortDate = (value?: string) => (value ? formatDate(value).slice(5) : '')

const formatWords = (words: number) =>
  words >= 10000 ? `${(words / 10000).toFixed(1)} 万` : `${words}`

export const Workspace: React.FC<Props> = ({ open, onClose, settings }) => {
  const { theme, toggleTheme } = useTheme()

  const [data, setData] = useState<WorkspaceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [hotkeys, setHotkeys] = useState(true)
  const [asideHidden, setAsideHiddenState] = useState(false)

  useEffect(() => {
    if (!open) return

    setHotkeys(getHotkeysEnabled())
    setAsideHiddenState(getAsideHidden())

    if (data) return

    let active = true

    setLoading(true)
    getWorkspaceData()
      .then((result) => {
        if (active) setData(result)
      })
      .catch((error) => {
        console.error('工作台数据加载失败', error)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [open, data])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && getHotkeysEnabled()) onClose()
    }

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  const toggleAside = () => {
    const next = !asideHidden

    setAsideHidden(next)
    setAsideHiddenState(next)
  }

  const toggleHotkeys = () => {
    const next = !hotkeys

    setHotkeysEnabled(next)
    setHotkeys(next)
  }

  const actions: DockAction[] = [
    {
      icon: theme === 'dark' ? Sun : Moon,
      key: 'theme',
      label: theme === 'dark' ? '切换到浅色模式' : '切换到深色模式',
      onClick: toggleTheme,
    },
    {
      active: hotkeys,
      icon: Keyboard,
      key: 'hotkey',
      label: hotkeys ? '关闭快捷键' : '开启快捷键',
      onClick: toggleHotkeys,
    },
    {
      active: asideHidden,
      icon: PanelRight,
      key: 'aside',
      label: asideHidden ? '显示侧边栏' : '隐藏侧边栏',
      onClick: toggleAside,
    },
  ]

  const stats = data?.stats
  const tags = stats?.tagStats.slice(0, 18) ?? []
  const maxTagCount = tags[0]?.count ?? 1

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-md dark:bg-slate-950/60"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="max-h-full w-full max-w-5xl overflow-y-auto rounded-3xl border border-slate-900/[0.06] bg-white p-5 shadow-2xl shadow-slate-900/20 md:p-8 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <div className="flex items-start gap-4">
              <SiteProfile
                className="min-w-0 flex-1"
                hint={hotkeys ? '按 Esc 关闭' : '点击遮罩关闭'}
                settings={settings}
                variant="banner"
              />

              <button
                aria-label="关闭工作台"
                className="glass-button flex h-9 w-9 shrink-0 items-center justify-center text-slate-600 dark:text-slate-300"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {loading && !data ? (
              <p className="mt-8 mb-4 animate-pulse text-center text-xs text-slate-400">
                正在加载站点数据…
              </p>
            ) : null}

            {data ? (
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <WorkspaceCard icon={Clock3} moreHref="/posts" title="最近更新">
                  <ul className="space-y-0.5">
                    {data.recent.map((post) => (
                      <li key={post.id}>
                        <Link
                          className="flex items-start justify-between gap-2 rounded-lg px-2 py-2 text-[15px] leading-snug text-slate-600 transition-colors hover:bg-slate-900/[0.04] hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-sky-300"
                          href={`/posts/${post.slug}`}
                          onClick={onClose}
                        >
                          <span className="line-clamp-1">{post.title}</span>
                          <span className="shrink-0 text-[13px] opacity-60">
                            {shortDate(post.publishedAt)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </WorkspaceCard>

                <WorkspaceCard icon={Flame} title="热门文章">
                  <ol className="space-y-0.5">
                    {data.hot.map((post, index) => (
                      <li key={post.id}>
                        <Link
                          className="flex items-start gap-2 rounded-lg px-2 py-2 text-[15px] leading-snug text-slate-600 transition-colors hover:bg-slate-900/[0.04] hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-sky-300"
                          href={`/posts/${post.slug}`}
                          onClick={onClose}
                        >
                          <span
                            className={cn(
                              'mt-px w-5 shrink-0 text-[13px] font-mono',
                              index < 3 ? 'text-indigo-500 dark:text-sky-300' : 'opacity-40',
                            )}
                          >
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="line-clamp-1">{post.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </WorkspaceCard>

                <div className="space-y-3">
                  <WorkspaceCard icon={TagsIcon} title="热门标签">
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => {
                        const ratio = tag.count / maxTagCount

                        return (
                          <Link
                            className="rounded-lg bg-slate-900/[0.05] px-2.5 py-1 text-slate-600 transition-colors hover:bg-indigo-500/12 hover:text-indigo-600 dark:bg-white/[0.07] dark:text-slate-300 dark:hover:bg-sky-400/12 dark:hover:text-sky-300"
                            href={`/tags/${encodeURIComponent(tag.name)}`}
                            key={tag.name}
                            onClick={onClose}
                            style={{ fontSize: `${13 + Math.round(ratio * 3)}px` }}
                          >
                            #{tag.name}
                          </Link>
                        )
                      })}
                    </div>
                  </WorkspaceCard>

                  <WorkspaceCard title="站点概览">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: '文章', value: stats?.posts ?? 0 },
                        { label: '分类', value: stats?.categories ?? 0 },
                        { label: '标签', value: stats?.tags ?? 0 },
                        { label: '总字数', value: formatWords(stats?.words ?? 0) },
                      ].map((cell) => (
                        <div
                          className="rounded-xl bg-slate-900/[0.04] px-3 py-2 dark:bg-white/[0.06]"
                          key={cell.label}
                        >
                          <p className="text-[17px] font-semibold text-slate-700 dark:text-slate-100">
                            {cell.value}
                          </p>
                          <p className="mt-0.5 text-[13px] text-slate-400">{cell.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 space-y-1.5 border-t border-slate-900/[0.06] pt-2.5 text-[14px] text-slate-500 dark:border-white/10 dark:text-slate-400">
                      <p className="flex items-center justify-between">
                        <span>运行天数</span>
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          {getRunningDays(stats?.since)} 天
                        </span>
                      </p>
                      <p className="flex items-center justify-between">
                        <span>最后更新</span>
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          {stats?.updated ? formatDate(stats.updated) : '—'}
                        </span>
                      </p>
                    </div>
                  </WorkspaceCard>
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              <Dock actions={actions} />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
