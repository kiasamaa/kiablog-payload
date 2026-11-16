'use client'

import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Command,
  Eye,
  Flame,
  Keyboard,
  LayoutGrid,
  Moon,
  Music2,
  Palette,
  PanelRight,
  Play,
  SkipBack,
  SkipForward,
  Sun,
  Tags as TagsIcon,
  Volume2,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react'

import { getWorkspaceData, type WorkspaceData, type WorkspacePost } from '@/app/actions/workspace'
import { useTheme } from '@/components/providers/ThemeProvider'
import type { SiteSetting } from '@/payload-types'
import {
  type BackgroundSettings,
  DEFAULT_BACKGROUND_SETTINGS,
  getBackgroundImageUrls,
  getBackgroundSettings,
  saveBackgroundSettings,
} from '@/utilities/backgroundPreferences'
import { formatDate, getRunningDays } from '@/utilities/formatDate'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import {
  getAsideHidden,
  getCompactLayout,
  getHotkeysEnabled,
  setAsideHidden,
  setCompactLayout,
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
const shortDate = (value?: string) => (value ? formatDate(value).slice(5) : '')
const formatWords = (words: number) =>
  words >= 10000 ? `${(words / 10000).toFixed(1)} 万` : `${words}`

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

const SkeletonRows: React.FC<{ count: number; height?: string }> = ({ count, height = 'h-8' }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, index) => (
      <div
        className={cn('animate-pulse rounded-lg bg-slate-900/[0.05] dark:bg-white/[0.06]', height)}
        key={`skeleton-${index}`}
      />
    ))}
  </div>
)

const Switch: React.FC<{ on: boolean }> = ({ on }) => (
  <span
    className={cn(
      'relative flex h-4 w-7 shrink-0 items-center rounded-full transition-colors',
      on ? 'bg-indigo-500 dark:bg-sky-400' : 'bg-slate-300 dark:bg-slate-600',
    )}
  >
    <span
      className={cn(
        'absolute h-3 w-3 rounded-full bg-white shadow-sm transition-transform',
        on ? 'translate-x-3.5' : 'translate-x-0.5',
      )}
    />
  </span>
)

const ToggleButton: React.FC<{
  label: string
  on: boolean
  onClick: () => void
}> = ({ label, on, onClick }) => (
  <button
    aria-pressed={on}
    className="flex flex-1 items-center justify-between gap-2 rounded-lg bg-slate-900/[0.04] px-2 py-1.5 text-[10.5px] text-slate-600 outline-none hover:bg-slate-900/[0.07] focus-visible:ring-2 focus-visible:ring-indigo-400/60 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/[0.09]"
    onClick={onClick}
    type="button"
  >
    {label}
    <Switch on={on} />
  </button>
)

const HotRow: React.FC<{ index: number; post: WorkspacePost; onClose: () => void }> = ({
  index,
  post,
  onClose,
}) => (
  <Link
    className="group flex min-h-[92px] flex-none items-start gap-3.5 border-b border-slate-900/[0.055] py-2 outline-none transition-colors last:border-b-0 hover:bg-slate-900/[0.025] focus-visible:ring-2 focus-visible:ring-indigo-400/60 dark:border-white/[0.07] dark:hover:bg-white/[0.03]"
    href={`/posts/${post.slug}`}
    onClick={onClose}
  >
    <span className="w-4 shrink-0 pt-1 font-mono text-[11px] font-semibold text-indigo-500 dark:text-sky-300">
      {String(index + 1).padStart(2, '0')}
    </span>

    <div className="relative h-[76px] w-[112px] shrink-0 self-center overflow-hidden rounded-xl bg-slate-900 ring-1 ring-inset ring-white/15">
      {post.coverUrl ? (
        <Image
          alt=""
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          fill
          sizes="112px"
          src={post.coverUrl}
        />
      ) : (
        <div aria-hidden className="post-card__fallback" />
      )}
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 text-[10.5px] text-slate-400">
        {post.categoryTitle ? (
          <span className="rounded-full bg-indigo-500/[0.09] px-1.5 py-0.5 text-[10.5px] font-semibold text-indigo-600 dark:bg-sky-400/10 dark:text-sky-300">
            {post.categoryTitle}
          </span>
        ) : null}
        <span>{shortDate(post.publishedAt)}</span>
      </div>

      <h4 className="mt-1 line-clamp-2 text-[15px] leading-[1.35] font-semibold text-slate-800 dark:text-slate-100">
        {post.title}
      </h4>

      {post.description ? (
        <p className="mt-1 line-clamp-2 text-[12px] leading-[1.5] text-slate-500 dark:text-slate-400">
          {post.description}
        </p>
      ) : null}

      <div className="mt-1.5 flex items-center gap-3 text-[10.5px] text-slate-400">
        <span>{post.readingTime || 1} 分钟</span>
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {post.views}
        </span>
      </div>
    </div>
  </Link>
)

export const Workspace: React.FC<Props> = ({
  open,
  onClose,
  settings,
  showAsideToggle = false,
}) => {
  const { theme, toggleTheme } = useTheme()
  const reducedMotion = useReducedMotion() ?? false
  const [data, setData] = useState<WorkspaceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [hotkeys, setHotkeys] = useState(true)
  const [asideHidden, setAsideHiddenState] = useState(false)
  const [compactLayout, setCompactLayoutState] = useState(false)
  const [bgSettings, setBgSettings] = useState<BackgroundSettings>(DEFAULT_BACKGROUND_SETTINGS)

  const bgImages = useMemo(
    () => getBackgroundImageUrls(settings?.backgroundImages),
    [settings?.backgroundImages],
  )

  useEffect(() => {
    if (!open) return

    setHotkeys(getHotkeysEnabled())
    setAsideHiddenState(getAsideHidden())
    setCompactLayoutState(getCompactLayout())

    const savedBg = getBackgroundSettings()
    const maxIndex = Math.max(0, bgImages.length - 1)
    setBgSettings({ ...savedBg, index: Math.min(savedBg.index, maxIndex) })

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
  }, [open, data, bgImages.length])

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

  const toggleCompact = () => {
    const next = !compactLayout

    setCompactLayout(next)
    setCompactLayoutState(next)
  }

  const updateBg = (patch: Partial<BackgroundSettings>) => {
    const maxIndex = Math.max(0, bgImages.length - 1)
    const next: BackgroundSettings = {
      ...bgSettings,
      ...patch,
      index: Math.min(maxIndex, Math.max(0, patch.index ?? bgSettings.index)),
    }

    setBgSettings(next)
    saveBackgroundSettings(next)
  }

  const stepBg = (delta: number) => {
    if (bgImages.length < 2) return

    const next = (bgSettings.index + delta + bgImages.length) % bgImages.length
    updateBg({ index: next })
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
    {
      active: compactLayout,
      icon: LayoutGrid,
      key: 'compact',
      label: '紧凑布局（3 列）',
      onClick: toggleCompact,
    },
  ]

  const siteTitle = settings?.siteTitle || 'Kira Blog'
  const authorName = settings?.authorName || siteTitle
  const bio = settings?.bio || '在这里记录技术、生活与那些值得被记住的瞬间。'
  const avatar = settings?.avatar && typeof settings.avatar === 'object' ? settings.avatar : null
  const avatarUrl = avatar ? getMediaUrl(avatar.sizes?.square?.url || avatar.url) : null
  const stats = data?.stats
  const tags = stats?.tagStats.slice(0, 18) ?? []
  const selectedBg = bgImages.length ? bgImages[bgSettings.index % bgImages.length] : ''

  const statCells = [
    { label: '文章', value: stats?.posts ?? '—' },
    { label: '分类', value: stats?.categories ?? '—' },
    { label: '标签', value: stats?.tags ?? '—' },
    { label: '总字数', value: stats ? formatWords(stats.words) : '—' },
  ]

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
            className="fixed inset-0 w-screen bg-slate-950/40 backdrop-blur-2xl dark:bg-slate-950/65"
            onClick={onClose}
          />

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            aria-label="工作台"
            aria-modal="true"
            className="workspace-panel relative mx-auto flex min-h-dvh w-full max-w-[1180px] flex-col gap-3.5 px-4 pt-[66px] pb-[18px] sm:px-6 lg:px-[30px]"
            exit={{ opacity: 0, y: 10 }}
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            role="dialog"
            transition={{ duration: 0.3, ease: EASE }}
          >
            <motion.header
              animate={{ opacity: 1, y: 0 }}
              className="mb-1.5 flex flex-none items-center gap-2"
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                <Command className="h-4 w-4 text-white/80" />
              </span>
              <h2 className="text-[24px] font-bold tracking-tight text-white">工作台</h2>
            </motion.header>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="grid min-h-0 flex-1 grid-cols-1 gap-3.5 lg:grid-cols-12 lg:grid-rows-2"
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              transition={{ delay: 0.04, duration: 0.34, ease: EASE }}
            >
              {/* 身份 + 统计 */}
              <section
                className={cn(
                  WORKSPACE_SURFACE,
                  'flex min-h-0 flex-col p-4 lg:col-span-3 lg:col-start-1 lg:row-start-1',
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[15px] ring-1 ring-white/50 dark:ring-white/10">
                    {avatarUrl ? (
                      <Image
                        alt={authorName}
                        className="object-cover"
                        fill
                        sizes="48px"
                        src={avatarUrl}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-sky-500 text-lg font-bold text-white">
                        {authorName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[16.5px] font-semibold text-slate-800 dark:text-slate-50">
                      {authorName}
                    </p>
                    <p className="truncate text-[11.5px] text-slate-400">
                      {authorName === siteTitle ? '独立博客' : siteTitle}
                    </p>
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 text-[12.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {bio}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {statCells.map((cell) => (
                    <div
                      className="rounded-[11px] bg-slate-900/[0.04] px-2.5 py-1.5 dark:bg-white/[0.06]"
                      key={cell.label}
                    >
                      <p className="text-[18px] leading-tight font-semibold text-slate-700 dark:text-slate-100">
                        {cell.value}
                      </p>
                      <p className="mt-0.5 text-[10.5px] text-slate-400">{cell.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-900/[0.06] pt-2.5 text-[10.5px] text-slate-400 dark:border-white/10">
                  <span>运行 {getRunningDays(stats?.since)} 天</span>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    更新 {stats?.updated ? formatDate(stats.updated) : '—'}
                  </span>
                </div>
              </section>

              {/* 背景设置 */}
              <WorkspaceCard
                bodyClassName="flex min-h-0 flex-col"
                className="lg:col-span-3 lg:col-start-1 lg:row-start-2"
                icon={Palette}
                title="背景设置"
              >
                <div className="flex min-h-0 flex-1 items-center justify-center py-1">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-900/[0.08] bg-slate-100 dark:border-white/10 dark:bg-slate-800">
                    {selectedBg && bgSettings.visible ? (
                      <Image
                        alt=""
                        className="object-cover"
                        fill
                        sizes="270px"
                        src={selectedBg}
                        style={{
                          filter: `blur(${Math.min(bgSettings.blur / 4, 5)}px)`,
                          opacity: bgSettings.opacity / 100,
                          transform: 'scale(1.04)',
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_18%_12%,rgba(255,255,255,.55),transparent_45%),radial-gradient(100%_100%_at_82%_88%,rgba(34,211,238,.42),transparent_55%),linear-gradient(150deg,#bfdbfe,#e0f2fe_55%,#dbeafe)]" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 to-transparent" />

                    {bgImages.length > 1 ? (
                      <>
                        <button
                          aria-label="上一张背景"
                          className="absolute top-1/2 left-1.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/35 text-white backdrop-blur-sm hover:bg-slate-950/55"
                          onClick={() => stepBg(-1)}
                          type="button"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                          aria-label="下一张背景"
                          className="absolute top-1/2 right-1.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-slate-950/35 text-white backdrop-blur-sm hover:bg-slate-950/55"
                          onClick={() => stepBg(1)}
                          type="button"
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                        <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1">
                          {bgImages.map((image, index) => (
                            <button
                              aria-label={`切换到第 ${index + 1} 张背景`}
                              className={cn(
                                'h-1.5 rounded-full transition-all',
                                index === bgSettings.index
                                  ? 'w-3 bg-white'
                                  : 'w-1.5 bg-white/50 hover:bg-white/80',
                              )}
                              key={image}
                              onClick={() => updateBg({ index })}
                              type="button"
                            />
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="flex-none pt-2">
                  <label className="flex items-center gap-2 text-[10.5px] text-slate-500 dark:text-slate-400">
                    <span className="w-8 shrink-0">模糊</span>
                    <input
                      aria-label="背景模糊度"
                      className="h-1 flex-1 cursor-pointer accent-indigo-500"
                      max={40}
                      min={0}
                      onChange={(event) => updateBg({ blur: Number(event.target.value) })}
                      type="range"
                      value={bgSettings.blur}
                    />
                    <span className="w-8 shrink-0 text-right text-[11px] tabular-nums">
                      {bgSettings.blur}px
                    </span>
                  </label>

                  <label className="mt-1.5 flex items-center gap-2 text-[10.5px] text-slate-500 dark:text-slate-400">
                    <span className="w-8 shrink-0">透明</span>
                    <input
                      aria-label="背景不透明度"
                      className="h-1 flex-1 cursor-pointer accent-indigo-500"
                      max={100}
                      min={0}
                      onChange={(event) => updateBg({ opacity: Number(event.target.value) })}
                      type="range"
                      value={bgSettings.opacity}
                    />
                    <span className="w-8 shrink-0 text-right text-[11px] tabular-nums">
                      {bgSettings.opacity}%
                    </span>
                  </label>

                  <div className="mt-2 flex gap-1.5">
                    <ToggleButton
                      label="光斑"
                      on={bgSettings.glow}
                      onClick={() => updateBg({ glow: !bgSettings.glow })}
                    />
                    <ToggleButton
                      label="背景图"
                      on={bgSettings.visible}
                      onClick={() => updateBg({ visible: !bgSettings.visible })}
                    />
                  </div>
                </div>
              </WorkspaceCard>

              {/* 热门文章 */}
              <WorkspaceCard
                bodyClassName="overflow-y-auto -mr-4 pr-4"
                className="lg:col-span-6 lg:col-start-4 lg:row-span-2 lg:row-start-1"
                icon={Flame}
                moreHref="/hots"
                title="热门文章"
              >
                {data ? (
                  <div className="flex flex-col">
                    {data.hot.slice(0, 5).map((post, index) => (
                      <HotRow index={index} key={post.id} onClose={onClose} post={post} />
                    ))}
                  </div>
                ) : (
                  <SkeletonRows count={3} height="h-[120px]" />
                )}
              </WorkspaceCard>

              {/* 最新更新 */}
              <WorkspaceCard
                bodyClassName="overflow-y-auto -mr-4 pr-4"
                className="lg:col-span-3 lg:col-start-10 lg:row-start-1"
                icon={Clock3}
                moreHref="/posts"
                title="最新更新"
              >
                {data ? (
                  <div className="flex flex-col">
                    {data.recent.slice(0, 8).map((post) => (
                      <Link
                        className="flex items-start gap-2 border-b border-slate-900/[0.05] py-3 text-[12.5px] text-slate-600 outline-none transition-colors last:border-b-0 hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-400/60 dark:border-white/[0.07] dark:text-slate-300 dark:hover:text-sky-300"
                        href={`/posts/${post.slug}`}
                        key={post.id}
                        onClick={onClose}
                      >
                        <span className="min-w-0 flex-1 leading-snug">{post.title}</span>
                        <span className="mt-px shrink-0 text-[10.5px] text-slate-400">
                          {shortDate(post.publishedAt)}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <SkeletonRows count={3} />
                )}
              </WorkspaceCard>

              {/* 热门标签 */}
              <WorkspaceCard
                bodyClassName="overflow-y-auto -mr-4 pr-4"
                className="lg:col-span-3 lg:col-start-10 lg:row-start-2"
                icon={TagsIcon}
                moreHref="/tags"
                title="热门标签"
              >
                {data ? (
                  tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <Link
                          className="rounded-full border border-slate-900/[0.06] bg-white/55 px-2.5 py-1 text-[11.5px] text-slate-600 transition-colors hover:border-indigo-300/70 hover:bg-indigo-500/10 hover:text-indigo-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:border-sky-400/40 dark:hover:bg-sky-400/10 dark:hover:text-sky-300"
                          href={`/tags/${encodeURIComponent(tag.name)}`}
                          key={tag.name}
                          onClick={onClose}
                        >
                          #{tag.name}
                          <span className="ml-1 text-slate-400 dark:text-slate-500">
                            {tag.count}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-slate-400">还没有标签。</p>
                  )
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {[0, 1, 2, 3].map((index) => (
                      <div
                        className="h-6 w-16 animate-pulse rounded-full bg-slate-900/[0.05] dark:bg-white/[0.06]"
                        key={`skeleton-tag-${index}`}
                      />
                    ))}
                  </div>
                )}
              </WorkspaceCard>
            </motion.div>

            {/* 音乐播放器：当前仅 UI 预览，不接音频 */}
            <section
              aria-label="音乐播放器（UI 预览）"
              className={cn(WORKSPACE_SURFACE, 'flex h-[76px] flex-none items-center gap-3.5 px-4')}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#0b1729] via-[#1e3a8a] to-[#0891b2] text-white/80">
                <Music2 className="h-5 w-5" />
              </div>

              <div className="w-[150px] min-w-0 shrink-0">
                <p className="truncate text-[14px] font-semibold text-slate-800 dark:text-slate-100">
                  夜航星
                </p>
                <p className="truncate text-[10.5px] text-slate-400">Demo · UI 预览</p>
              </div>

              <div aria-hidden className="flex shrink-0 items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center text-slate-400">
                  <SkipBack className="h-3 w-3" />
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-500/25">
                  <Play className="h-3 w-3 translate-x-px" />
                </span>
                <span className="flex h-7 w-7 items-center justify-center text-slate-400">
                  <SkipForward className="h-3 w-3" />
                </span>
              </div>

              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="text-[10.5px] text-slate-400 tabular-nums">1:24</span>
                <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-slate-900/[0.08] dark:bg-white/[0.1]">
                  <span className="absolute inset-y-0 left-0 w-[42%] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                </span>
                <span className="text-[10.5px] text-slate-400 tabular-nums">3:18</span>
              </div>

              <Volume2 className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
            </section>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-none justify-center pt-0.5"
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              transition={{ delay: 0.08, duration: 0.3, ease: EASE }}
            >
              <Dock actions={actions} />
            </motion.div>

            {loading && !data ? (
              <p className="sr-only" role="status">
                正在加载站点数据
              </p>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
