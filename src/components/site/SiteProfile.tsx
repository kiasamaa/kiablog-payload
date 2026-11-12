import Image from 'next/image'
import React from 'react'

import type { SiteSetting } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

export type SiteProfileVariant = 'hero' | 'card' | 'banner' | 'aside'

type Props = {
  settings: SiteSetting | null
  variant: SiteProfileVariant
  /** hero 变体下方的操作按钮 */
  actions?: React.ReactNode
  /** 覆盖默认简介（如关于页用 About 全局的自我介绍） */
  description?: React.ReactNode
  /** banner 变体右侧的提示（如「按 Esc 关闭」） */
  hint?: React.ReactNode
  className?: string
}

const FALLBACK_BIO = '在这里记录技术、生活与那些值得被记住的瞬间。'

export const SiteProfile: React.FC<Props> = ({
  settings,
  variant,
  actions,
  description,
  hint,
  className,
}) => {
  const siteTitle = settings?.siteTitle || 'Kira Blog'
  const authorName = settings?.authorName || siteTitle
  const bio = settings?.bio || FALLBACK_BIO
  const avatar = settings?.avatar && typeof settings.avatar === 'object' ? settings.avatar : null
  const avatarUrl = avatar ? getMediaUrl(avatar.sizes?.square?.url || avatar.url) : null
  const socialLinks = settings?.socialLinks ?? []

  const descriptionNode = description ?? <p>{bio}</p>

  if (variant === 'hero') {
    return (
      <div className={cn('glass-card w-full rounded-3xl p-8 md:p-12', className)}>
        <p className="text-xs font-medium tracking-[0.35em] text-indigo-500 uppercase dark:text-sky-300">
          Welcome
        </p>

        <h1 className="mt-5 font-serif text-[30px] leading-[1.15] font-bold text-slate-800 md:text-[44px] dark:text-slate-50">
          {siteTitle}
        </h1>

        <div className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600 md:text-base dark:text-slate-300">
          {descriptionNode}
        </div>

        {actions ? <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div className={cn('flex items-start gap-4', className)}>
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/40 dark:ring-white/10">
          {avatarUrl ? (
            <Image alt={authorName} className="object-cover" fill sizes="56px" src={avatarUrl} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-sky-500 text-sm font-bold text-white">
              {authorName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="font-serif text-[18px] font-bold text-slate-800 dark:text-slate-50">
            欢迎来到 {siteTitle}
          </p>
          <div className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
            {descriptionNode}
          </div>
        </div>

        {hint ? <div className="ml-auto shrink-0 text-[13px] text-slate-400">{hint}</div> : null}
      </div>
    )
  }

  if (variant === 'aside') {
    return (
      <div className={cn('flex flex-col items-center text-center', className)}>
        <div className="relative h-16 w-16 overflow-hidden rounded-2xl ring-1 ring-white/50 dark:ring-white/10">
          {avatarUrl ? (
            <Image alt={authorName} className="object-cover" fill sizes="64px" src={avatarUrl} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-sky-500 text-base font-bold text-white">
              {authorName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <p className="mt-3 font-serif text-[17px] font-bold text-slate-800 dark:text-slate-50">
          {authorName}
        </p>

        <div className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
          {descriptionNode}
        </div>

        {socialLinks.length > 0 ? (
          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
            {socialLinks.map((link) => (
              <a
                className="rounded-lg bg-slate-900/[0.05] px-3 py-1 text-[13px] text-slate-600 transition-colors hover:bg-indigo-500/12 hover:text-indigo-600 dark:bg-white/[0.07] dark:text-slate-300 dark:hover:bg-sky-400/12 dark:hover:text-sky-300"
                href={link.url}
                key={`${link.label}-${link.url}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  // card
  return (
    <div className={cn('glass-card rounded-3xl p-7 md:p-9', className)}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/40 dark:ring-white/10">
          {avatarUrl ? (
            <Image alt={authorName} className="object-cover" fill sizes="80px" src={avatarUrl} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-sky-500 text-xl font-bold text-white">
              {authorName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h2 className="font-serif text-xl font-bold text-slate-800 dark:text-slate-50">
            {authorName}
          </h2>

          <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {descriptionNode}
          </div>

          {socialLinks.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <a
                  className="glass-button px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200"
                  href={link.url}
                  key={`${link.label}-${link.url}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
