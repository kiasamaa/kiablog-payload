'use client'

import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Copy,
  ExternalLink,
  ImageDown,
  ImagePlus,
  Link2,
  Moon,
  RotateCw,
  Search,
  Shuffle,
  Sun,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useTheme } from '@/components/providers/ThemeProvider'
import { cn } from '@/utilities/ui'

type Group = 'normal' | 'text' | 'link' | 'image'

type MenuState = {
  x: number
  y: number
  group: Group
  selection: string
  link: string
  image: string
}

const ITEM_CLASS =
  'flex h-[34px] w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] text-slate-700 transition-colors hover:bg-indigo-500 hover:text-white dark:text-slate-200 dark:hover:bg-sky-400/20 dark:hover:text-sky-100'

const NAV_GROUP_CLASS =
  'flex h-8 flex-1 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-indigo-500 hover:text-white dark:text-slate-400 dark:hover:bg-sky-400/20 dark:hover:text-sky-100'

export const ContextMenu: React.FC = () => {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  const [menu, setMenu] = useState<MenuState | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null

      if (!target) return
      if (target.closest('input, textarea, [contenteditable="true"]')) return
      if (window.matchMedia('(pointer: coarse)').matches) return

      event.preventDefault()

      const imageEl = target.closest('img') as HTMLImageElement | null
      const linkEl = target.closest('a[href]') as HTMLAnchorElement | null
      const selection = (window.getSelection()?.toString() || '').trim()

      let group: Group = 'normal'
      if (imageEl) group = 'image'
      else if (linkEl) group = 'link'
      else if (selection) group = 'text'

      setFeedback(null)
      setMenu({
        group,
        image: imageEl?.currentSrc || imageEl?.src || '',
        link: linkEl?.href || '',
        selection,
        x: event.clientX,
        y: event.clientY,
      })
    }

    document.addEventListener('contextmenu', onContextMenu)

    return () => document.removeEventListener('contextmenu', onContextMenu)
  }, [])

  useEffect(() => {
    if (!menu) return

    const close = () => setMenu(null)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }

    window.addEventListener('scroll', close, { passive: true })
    window.addEventListener('resize', close)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('scroll', close)
      window.removeEventListener('resize', close)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menu])

  // 用固定尺寸估算可用空间来决定展开方向，避免依赖布局测量
  const placement = menu
    ? (() => {
        const gap = 8
        const menuWidth = 200
        const menuHeight = 240
        const left =
          menu.x + gap + menuWidth > window.innerWidth - gap
            ? Math.max(gap, menu.x - menuWidth - gap)
            : menu.x + gap
        const up = menu.y + gap + menuHeight > window.innerHeight - gap

        return { left, up }
      })()
    : null

  const flash = useCallback((text: string) => {
    setFeedback(text)
    window.setTimeout(() => {
      setFeedback(null)
      setMenu(null)
    }, 700)
  }, [])

  const copyText = useCallback(
    async (text: string, done = '已复制') => {
      if (!navigator.clipboard?.writeText) {
        console.error('当前环境不支持剪贴板写入')
        return
      }

      await navigator.clipboard.writeText(text)
      flash(done)
    },
    [flash],
  )

  const copyImage = useCallback(
    async (src: string) => {
      const response = await fetch(src)
      const blob = await response.blob()

      if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
        console.error('当前浏览器不支持复制图片')
        return
      }

      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
      flash('图片已复制')
    },
    [flash],
  )

  const downloadImage = useCallback(
    async (src: string) => {
      const response = await fetch(src)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      const extension = blob.type.split('/')[1] || 'png'

      anchor.href = url
      anchor.download = `image-${Date.now()}.${extension}`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
      flash('已开始下载')
    },
    [flash],
  )

  const goRandom = useCallback(async () => {
    const response = await fetch('/api/posts?limit=100&depth=0')
    const data = (await response.json()) as { docs?: { slug?: string }[] }
    const docs = data.docs?.filter((doc) => doc.slug) ?? []

    setMenu(null)

    if (docs.length === 0) return

    const pick = docs[Math.floor(Math.random() * docs.length)]

    router.push(`/posts/${pick.slug}`)
  }, [router])

  return (
    <AnimatePresence>
      {menu ? (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="fixed z-[80] w-[200px] rounded-xl border border-slate-900/10 bg-white p-1 shadow-2xl shadow-slate-900/20 dark:border-white/15 dark:bg-[#0d1117] dark:shadow-black/60"
          exit={{ opacity: 0, scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.95 }}
          onMouseDown={(event) => event.stopPropagation()}
          ref={menuRef}
          style={
            placement
              ? placement.up
                ? { bottom: window.innerHeight - menu.y + 8, left: placement.left }
                : { left: placement.left, top: menu.y + 8 }
              : undefined
          }
          transition={{ duration: 0.14, ease: 'easeOut' }}
        >
          <div className="mb-1 flex items-center gap-0.5 rounded-lg bg-slate-50 px-1 py-1 dark:bg-white/5">
            <button
              aria-label="后退"
              className={NAV_GROUP_CLASS}
              onClick={() => {
                setMenu(null)
                history.back()
              }}
              title="后退"
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="前进"
              className={NAV_GROUP_CLASS}
              onClick={() => {
                setMenu(null)
                history.forward()
              }}
              title="前进"
              type="button"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              aria-label="刷新"
              className={NAV_GROUP_CLASS}
              onClick={() => {
                setMenu(null)
                window.location.reload()
              }}
              title="刷新"
              type="button"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <button
              aria-label="回到顶部"
              className={NAV_GROUP_CLASS}
              onClick={() => {
                setMenu(null)
                window.scrollTo({ behavior: 'smooth', top: 0 })
              }}
              title="回到顶部"
              type="button"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>

          <div className="border-t border-slate-900/10 pt-1 dark:border-white/10">
            {menu.group === 'normal' ? (
              <>
                <MenuItem
                  icon={Shuffle}
                  label="随便逛逛"
                  onClick={() => {
                    void goRandom()
                  }}
                />
                <MenuItem
                  icon={Link2}
                  label="复制地址"
                  onClick={() => {
                    void copyText(window.location.href)
                  }}
                />
                <MenuItem
                  icon={theme === 'dark' ? Sun : Moon}
                  label={theme === 'dark' ? '浅色模式' : '深色模式'}
                  onClick={() => {
                    toggleTheme()
                    setMenu(null)
                  }}
                />
              </>
            ) : null}

            {menu.group === 'text' ? (
              <>
                <MenuItem
                  icon={Copy}
                  label="复制选中文本"
                  onClick={() => {
                    void copyText(menu.selection)
                  }}
                />
                <MenuItem
                  icon={Search}
                  label="必应搜索"
                  onClick={() => {
                    window.open(
                      `https://www.bing.com/search?q=${encodeURIComponent(menu.selection)}`,
                      '_blank',
                      'noopener',
                    )
                    setMenu(null)
                  }}
                />
              </>
            ) : null}

            {menu.group === 'link' ? (
              <>
                <MenuItem
                  icon={ExternalLink}
                  label="新窗口打开"
                  onClick={() => {
                    window.open(menu.link, '_blank', 'noopener')
                    setMenu(null)
                  }}
                />
                <MenuItem
                  icon={Copy}
                  label="复制链接地址"
                  onClick={() => {
                    void copyText(menu.link)
                  }}
                />
              </>
            ) : null}

            {menu.group === 'image' ? (
              <>
                <MenuItem
                  icon={ImagePlus}
                  label="复制图片"
                  onClick={() => {
                    void copyImage(menu.image)
                  }}
                />
                <MenuItem
                  icon={ImageDown}
                  label="下载图片"
                  onClick={() => {
                    void downloadImage(menu.image)
                  }}
                />
              </>
            ) : null}
          </div>

          {feedback ? (
            <p className="mt-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-center text-[11px] text-slate-500 dark:bg-white/5 dark:text-slate-400">
              {feedback}
            </p>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

const MenuItem: React.FC<{
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}> = ({ icon: Icon, label, onClick }) => (
  <button className={cn(ITEM_CLASS)} onClick={onClick} type="button">
    <Icon className="h-4 w-4 shrink-0 opacity-80" />
    <span className="truncate">{label}</span>
  </button>
)
