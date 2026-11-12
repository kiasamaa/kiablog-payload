'use client'

import {
  ArrowUp,
  BookOpen,
  Command,
  FolderOpen,
  FolderTree,
  Home,
  Menu,
  Search,
  Tag,
} from 'lucide-react'
import { motion, useMotionValueEvent, useScroll, type Transition } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import { useReading } from '@/components/providers/ReadingProvider'
import type { SiteSetting } from '@/payload-types'
import type { NavCategory } from '@/utilities/getNavData'
import { cn } from '@/utilities/ui'

import { MobileMenu } from './MobileMenu'
import { NavDropdown } from './NavDropdown'
import { SearchOverlay } from './SearchOverlay'
import { Workspace } from '../workspace/Workspace'

const NAV_TRANSITION: Transition = {
  duration: 0.45,
  ease: [0.22, 0.61, 0.36, 1],
}
const ICON_BUTTON =
  'flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-white/40 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'

export const Navbar: React.FC<{
  siteTitle: string
  categories: NavCategory[]
  totalPosts: number
  settings: SiteSetting | null
}> = ({ siteTitle, categories, totalPosts, settings }) => {
  const pathname = usePathname()
  const { readingTitle } = useReading()
  const { scrollY } = useScroll()

  const [compact, setCompact] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [narrow, setNarrow] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [consoleOpen, setConsoleOpen] = useState(false)
  const lastY = useRef(0)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const diff = y - lastY.current
    const nextCompact = y > 24

    setCompact((prev) => (prev === nextCompact ? prev : nextCompact))

    if (y > 160 && diff > 6) {
      setHidden(true)
    } else if (diff < -6 || y <= 160) {
      setHidden(false)
    }

    lastY.current = y
  })

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const update = () => setNarrow(media.matches)

    update()
    media.addEventListener('change', update)

    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const contentWidth = compact ? (narrow ? '92%' : '66.66%') : '100%'
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      <motion.header
        animate={{ y: hidden ? -80 : compact ? 6 : 0 }}
        className="fixed inset-x-0 top-0 z-50 h-12"
        transition={{ duration: hidden ? 0.26 : 0.42, ease: 'easeOut' }}
      >
        {/* 胶囊背景：顶部透明，滚动后收拢 */}
        <motion.div
          animate={{
            borderRadius: compact ? 16 : 0,
            opacity: compact ? 1 : 0,
            width: contentWidth,
          }}
          aria-hidden
          className="absolute top-0 left-1/2 h-12 border border-white/40 bg-white/65 shadow-lg shadow-slate-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
          style={{ x: '-50%' }}
          transition={NAV_TRANSITION}
        />

        <motion.div
          animate={{ width: contentWidth }}
          className="relative mx-auto flex h-12 max-w-[80rem] items-center justify-between gap-2 px-3"
          transition={NAV_TRANSITION}
        >
          <div className="flex min-w-0 items-center gap-1">
            <Link
              className="group flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100"
              href="/"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-sky-500 to-cyan-400 text-xs font-bold text-white shadow-lg shadow-sky-500/25">
                {siteTitle.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-[8rem] truncate sm:block">{siteTitle}</span>
            </Link>

            <nav className="ml-1 hidden items-center gap-0.5 md:flex">
              <NavLink active={isActive('/')} href="/" icon={Home} label="首页" />

              <NavDropdown label="开始浏览" width="w-64">
                <Link
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-indigo-500/10 dark:text-slate-200 dark:hover:bg-sky-400/10"
                  href="/posts"
                >
                  <BookOpen className="h-4 w-4 opacity-70" />
                  <span className="flex-1">全部文章</span>
                  <span className="text-xs text-slate-400">{totalPosts}</span>
                </Link>

                <Link
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-indigo-500/10 dark:text-slate-200 dark:hover:bg-sky-400/10"
                  href="/categories"
                >
                  <FolderOpen className="h-4 w-4 opacity-70" />
                  <span className="flex-1">分类列表</span>
                  <span className="text-xs text-slate-400">{categories.length}</span>
                </Link>

                <Link
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-indigo-500/10 dark:text-slate-200 dark:hover:bg-sky-400/10"
                  href="/tags"
                >
                  <Tag className="h-4 w-4 opacity-70" />
                  <span className="flex-1">标签列表</span>
                </Link>
              </NavDropdown>

              <NavDropdown label="专栏" width="w-52">
                <Link
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-indigo-500/10 dark:text-slate-200 dark:hover:bg-sky-400/10"
                  href="/photowall"
                >
                  <FolderTree className="h-4 w-4 opacity-70" />
                  壁纸墙
                </Link>
                <Link
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-indigo-500/10 dark:text-slate-200 dark:hover:bg-sky-400/10"
                  href="/about"
                >
                  <Home className="h-4 w-4 opacity-70" />
                  关于
                </Link>
              </NavDropdown>
            </nav>
          </div>

          {/* 中间：正在阅读 / 站点名 */}
          <div className="pointer-events-none absolute left-1/2 hidden w-[38%] -translate-x-1/2 lg:block">
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="truncate text-center text-xs text-slate-500 dark:text-slate-400"
              initial={{ opacity: 0, y: 4 }}
              key={readingTitle || siteTitle}
              transition={{ duration: 0.25 }}
            >
              {readingTitle ? (
                <>
                  <span className="text-slate-400 dark:text-slate-500">正在阅读：</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {readingTitle}
                  </span>
                </>
              ) : (
                siteTitle
              )}
            </motion.p>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <NavIconButton icon={Search} label="搜索" onClick={() => setSearchOpen(true)} />

            <NavIconButton
              className="hidden md:flex"
              icon={ArrowUp}
              label="回到顶部"
              onClick={() => window.scrollTo({ behavior: 'smooth', top: 0 })}
            />

            <NavIconButton
              className="hidden md:flex"
              icon={Command}
              label="工作台"
              onClick={() => setConsoleOpen(true)}
            />

            <NavIconButton
              className="md:hidden"
              icon={Menu}
              label="菜单"
              onClick={() => {
                setHidden(false)
                setMobileOpen((open) => !open)
              }}
            />
          </div>
        </motion.div>
      </motion.header>

      <div className="fixed inset-x-0 top-12 z-40 md:hidden">
        <MobileMenu categories={categories} onClose={() => setMobileOpen(false)} open={mobileOpen} />
      </div>

      <SearchOverlay onClose={() => setSearchOpen(false)} open={searchOpen} />
      <Workspace
        onClose={() => setConsoleOpen(false)}
        open={consoleOpen}
        settings={settings}
      />
    </>
  )
}

const NavLink: React.FC<{
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
}> = ({ href, label, icon: Icon, active }) => (
  <Link
    className={cn(
      'relative flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-colors',
      active
        ? 'text-indigo-600 dark:text-sky-300'
        : 'text-slate-600 hover:bg-white/40 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white',
    )}
    href={href}
  >
    <Icon className="h-4 w-4" />
    {label}
    {active ? (
      <motion.span
        className="absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
        layoutId="nav-underline"
      />
    ) : null}
  </Link>
)

const NavIconButton: React.FC<{
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick?: () => void
  className?: string
}> = ({ icon: Icon, label, onClick, className }) => (
  <motion.button
    aria-label={label}
    className={cn(ICON_BUTTON, className)}
    onClick={onClick}
    title={label}
    transition={{ duration: 0.15 }}
    type="button"
    whileHover={{ scale: 1.06 }}
    whileTap={{ scale: 0.94 }}
  >
    <Icon className="h-4 w-4" />
  </motion.button>
)
