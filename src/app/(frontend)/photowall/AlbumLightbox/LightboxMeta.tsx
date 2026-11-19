'use client'

import { motion } from 'motion/react'
import React from 'react'

import { isHttpUrl } from '../utils'

type Props = {
  author?: string | null
  reducedMotion: boolean
  source?: string | null
}

const TEXT_SHADOW = '[text-shadow:0_1px_6px_rgba(0,0,0,.55)]'

/**
 * 作者与来源：固定在底部居中，不随图片尺寸上下漂移。
 * 左右留出 px-16/24 是为了避开移动端底部的切换按钮。
 */
export const LightboxMeta: React.FC<Props> = ({ author, reducedMotion, source }) => {
  const trimmed = source?.trim()

  if (!author && !trimmed) return null

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-16 sm:bottom-6 sm:px-24"
      initial={reducedMotion ? false : { opacity: 0, y: 6 }}
      transition={{ delay: reducedMotion ? 0 : 0.14, duration: 0.28, ease: 'easeOut' }}
    >
      <div className="flex max-w-full items-baseline justify-center gap-3 text-[13px] leading-snug">
        {author ? (
          <span className={`max-w-[40vw] shrink-0 truncate text-white/90 ${TEXT_SHADOW}`}>
            {author}
          </span>
        ) : null}

        {trimmed ? (
          isHttpUrl(trimmed) ? (
            <a
              className={`pointer-events-auto max-w-[45vw] truncate text-sky-200 underline decoration-sky-300/40 underline-offset-4 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none sm:max-w-[36vw] ${TEXT_SHADOW}`}
              href={trimmed}
              onClick={(event) => event.stopPropagation()}
              rel="noreferrer noopener"
              target="_blank"
              title={trimmed}
            >
              {trimmed}
            </a>
          ) : (
            <span className={`max-w-[45vw] truncate text-white/75 ${TEXT_SHADOW} sm:max-w-[36vw]`}>
              {trimmed}
            </span>
          )
        ) : null}
      </div>
    </motion.div>
  )
}
