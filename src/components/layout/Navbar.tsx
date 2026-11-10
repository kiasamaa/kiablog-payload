'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Camera, Home, Menu, Moon, Sun, User, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { useTheme } from '@/components/providers/ThemeProvider'
import { cn } from '@/utilities/ui'

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/posts', label: '文章', icon: BookOpen },
  { href: '/photowall', label: '照片墙', icon: Camera },
  { href: '/about', label: '关于', icon: User },
]

const isActivePath = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

export const Navbar: React.FC<{ siteTitle: string }> = ({ siteTitle }) => {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 h-16 border-b transition-all duration-300',
        scrolled
          ? 'border-white/20 bg-white/70 shadow-[0_8px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70'
          : 'border-transparent bg-white/30 backdrop-blur-md dark:bg-slate-900/20',
      )}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          className="group flex items-center gap-2 text-base font-semibold tracking-tight text-slate-800 transition-colors hover:text-indigo-500 dark:text-slate-100 dark:hover:text-sky-300"
          href="/"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-purple-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">
            {siteTitle.slice(0, 1).toUpperCase()}
          </span>
          <span className="max-w-[10rem] truncate">{siteTitle}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href)

            return (
              <Link
                className={cn(
                  'group relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-indigo-600 dark:text-sky-300'
                    : 'text-slate-600 hover:bg-white/40 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white',
                )}
                href={href}
                key={href}
              >
                <Icon className="h-4 w-4" />
                {label}
                {active ? (
                  <motion.span
                    className="absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                    layoutId="nav-underline"
                  />
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
            className="glass-button flex h-10 w-10 items-center justify-center text-slate-600 hover:text-indigo-500 dark:text-slate-200 dark:hover:text-sky-300"
            onClick={toggleTheme}
            type="button"
          >
            {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <button
            aria-expanded={menuOpen}
            aria-label="打开导航菜单"
            className="glass-button flex h-10 w-10 items-center justify-center text-slate-600 dark:text-slate-200 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.nav
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden border-t border-white/20 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/85 md:hidden"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
              {navItems.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                      isActivePath(pathname, href)
                        ? 'bg-gradient-to-r from-indigo-500/15 to-sky-400/15 text-indigo-600 dark:text-sky-300'
                        : 'text-slate-700 hover:bg-white/50 dark:text-slate-200 dark:hover:bg-white/10',
                    )}
                    href={href}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
