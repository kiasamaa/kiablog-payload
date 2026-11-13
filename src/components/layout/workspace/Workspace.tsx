'use client'

import { AnimatePresence, motion, type Transition } from 'motion/react'
import { Clock3, Flame, Keyboard, Moon, PanelRight, Sun, Tags as TagsIcon } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useLayoutEffect, useState } from 'react'

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
import { WorkspaceCard, WORKSPACE_SURFACE } from './WorkspaceCard'

type Props = {
  open: boolean
  onClose: () => void
  settings: SiteSetting | null
  /** 当前页面是否存在可折叠的侧边栏 */
  showAsideToggle?: boolean
}

const EASE: Transition['ease'] = [0.22, 0.61, 0.36, 1]
const ROW =
  'flex items-start gap-2 rounded-lg px-2 py-[7px] text-[14px] leading-snug text-slate-600 transition-colors hover:bg-slate-900/[0.04] hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-sky-300'
/** 右侧标签/概览列按文章页侧栏的 300px 收窄，左右两列平分剩余空间 */
const GRID = 'grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_300px]'

/**
 * 滚动锁定：挂在工作台子树里，随 AnimatePresence 的退出动画一起卸载。
 *
 * 用 layout effect 在浏览器绘制前锁住根滚动，打开时不会先画出一帧"页面滚动条 + 工作台滚动条"并排；
 * 退出动画播完才解锁，关闭时也不会再闪一下。
 */
const ScrollLock: React.FC = () => {
  useLayoutEffect(() => {
    const { body, documentElement } = document
    const previousHtmlOverflow = documentElement.style.overflow
    const previousBodyOverflow = body.style.overflow

    documentElement.style.overflow = 'hidden'
    body.style.overflow = 'hidden'

    return () => {
      documentElement.style.overflow = previousHtmlOverflow
      body.style.overflow = previousBodyOverflow
    }
  }, [])

  return null
}

const shortDate = (value?: string) => (value ? formatDate(value).slice(5) : '')
const formatWords = (words: number) =>
  words >= 10000 ? `${(words / 10000).toFixed(1)} 万` : `${words}`

export const Workspace: React.FC<Props> = ({ open, onClose, settings, showAsideToggle = false }) => {
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

    window.addEventListener('keydown', onKeyDown)

    return () => {
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
      label: hotkeys ? '关闭快捷键（Esc）' : '开启快捷键（Esc）',
      onClick: toggleHotkeys,
    },
    ...(showAsideToggle
      ? [
          {
            active: !asideHidden,
            icon: PanelRight,
            key: 'aside',
            label: asideHidden ? '显示侧边栏' : '隐藏侧边栏',
            onClick: toggleAside,
          },
        ]
      : []),
  ]

  const stats = data?.stats
  const tags = stats?.tagStats.slice(0, 18) ?? []
  const maxTagCount = tags[0]?.count ?? 1

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="no-scrollbar fixed inset-0 z-[45] overflow-y-auto overscroll-contain"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <ScrollLock />

          <div
            aria-hidden
            className="fixed inset-0 w-screen bg-slate-950/35 backdrop-blur-md dark:bg-slate-950/60"
            onClick={onClose}
          />

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-4 px-4 pt-20 pb-10 sm:px-6 lg:px-8"
            exit={{ opacity: 0, y: 10 }}
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <motion.section
              animate={{ opacity: 1, y: 0 }}
              className={cn(WORKSPACE_SURFACE, 'px-5 py-4')}
              initial={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.34, ease: EASE }}
            >
              <SiteProfile
                hint={hotkeys ? '按 Esc 关闭' : '点击遮罩关闭'}
                settings={settings}
                variant="banner"
              />
            </motion.section>

            {!data ? (
              <div className={GRID}>
                {[0, 1, 2].map((index) => (
                  <div
                    className={cn(WORKSPACE_SURFACE, 'h-72 animate-pulse opacity-70')}
                    key={`skeleton-${index}`}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className={GRID}
                initial={{ opacity: 0, y: 18 }}
                transition={{ delay: 0.05, duration: 0.34, ease: EASE }}
              >
                <WorkspaceCard className="h-full" icon={Clock3} moreHref="/posts" title="最近更新">
                  <ul>
                    {data.recent.map((post) => (
                      <li key={post.id}>
                        <Link className={ROW} href={`/posts/${post.slug}`} onClick={onClose}>
                          <span className="line-clamp-1 flex-1">{post.title}</span>
                          <span className="shrink-0 text-[13px] opacity-60">
                            {shortDate(post.publishedAt)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </WorkspaceCard>

                <WorkspaceCard className="h-full" icon={Flame} title="热门文章">
                  <ol>
                    {data.hot.map((post, index) => (
                      <li key={post.id}>
                        <Link className={ROW} href={`/posts/${post.slug}`} onClick={onClose}>
                          <span
                            className={cn(
                              'mt-px w-5 shrink-0 font-mono text-[13px]',
                              index < 3 ? 'text-indigo-500 dark:text-sky-300' : 'opacity-40',
                            )}
                          >
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="line-clamp-1 flex-1">{post.title}</span>
                          <span className="shrink-0 text-[13px] opacity-60">
                            {shortDate(post.publishedAt)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </WorkspaceCard>

                <div className="flex flex-col gap-4">
                  <WorkspaceCard className="flex-1" icon={TagsIcon} title="热门标签">
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Link
                          className="rounded-lg bg-slate-900/[0.05] px-2.5 py-1 text-slate-600 transition-colors hover:bg-indigo-500/12 hover:text-indigo-600 dark:bg-white/[0.07] dark:text-slate-300 dark:hover:bg-sky-400/12 dark:hover:text-sky-300"
                          href={`/tags/${encodeURIComponent(tag.name)}`}
                          key={tag.name}
                          onClick={onClose}
                          style={{ fontSize: `${13 + Math.round((tag.count / maxTagCount) * 2)}px` }}
                        >
                          #{tag.name}
                        </Link>
                      ))}
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

                    <div className="mt-3 space-y-1.5 border-t border-slate-900/[0.06] pt-2.5 text-[13px] text-slate-500 dark:border-white/10 dark:text-slate-400">
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
              </motion.div>
            )}

            {loading && !data ? (
              <p className="sr-only" role="status">
                正在加载站点数据
              </p>
            ) : null}

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mt-auto pt-2"
              initial={{ opacity: 0, y: 12 }}
              transition={{ delay: 0.1, duration: 0.3, ease: EASE }}
            >
              <Dock actions={actions} />
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
