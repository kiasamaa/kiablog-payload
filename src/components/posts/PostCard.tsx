'use client'

import { Clock, Eye, Pin } from 'lucide-react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'

export type PostCardData = {
  id: number
  title: string
  slug: string
  description?: null | string
  coverUrl?: null | string
  categoryTitle?: null | string
  categorySlug?: null | string
  tags?: string[]
  isPinned?: boolean | null
  views?: number | null
  readingTime?: number | null
  publishedAtLabel?: string
}

type Props = {
  post: PostCardData
  index: number
}

/**
 * 文章卡：整张封面 + 底部信息层。
 *
 * 两档排版由 <html data-post-layout> 的 CSS 接管：
 * 舒展模式 2 列（标题 20px / 摘要 2 行），紧凑模式 3 列（标题 18px / 摘要 1 行）。
 * 组件本身不接收 compact prop，避免 SSR 与 localStorage 偏好不一致导致的跳动。
 */
export const PostCard: React.FC<Props> = ({ post, index }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion() ?? false
  const [canTilt, setCanTilt] = useState(false)

  const rotateX = useSpring(0, { damping: 26, mass: 0.6, stiffness: 220 })
  const rotateY = useSpring(0, { damping: 26, mass: 0.6, stiffness: 220 })
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)
  const glareOpacity = useSpring(0, { damping: 24, stiffness: 180 })
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.12), transparent 55%)`

  useEffect(() => {
    if (reducedMotion) {
      setCanTilt(false)
      return
    }

    const media = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setCanTilt(media.matches)

    update()
    media.addEventListener('change', update)

    return () => media.removeEventListener('change', update)
  }, [reducedMotion])

  const resetTilt = () => {
    rotateX.set(0)
    rotateY.set(0)
    glareOpacity.set(0)
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canTilt || !cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height

    // 最大 ±3° / ±2°，只改 MotionValue，不触发 React 重渲染
    rotateY.set((px - 0.5) * 6)
    rotateX.set((0.5 - py) * 4)
    glareX.set(px * 100)
    glareY.set(py * 100)
    glareOpacity.set(1)
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      transition={{
        delay: reducedMotion ? 0 : Math.min(index, 8) * 0.045,
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        reducedMotion
          ? undefined
          : { y: -4, transition: { damping: 26, stiffness: 260, type: 'spring' } }
      }
    >
      <Link
        className="post-card group block rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        href={`/posts/${post.slug}`}
        onFocus={resetTilt}
      >
        <div
          className="post-card__frame relative"
          onMouseLeave={resetTilt}
          onMouseMove={handleMouseMove}
          ref={cardRef}
        >
          <motion.div
            className="relative"
            style={{
              rotateX,
              rotateY,
              transformPerspective: 1000,
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="post-card__media relative bg-slate-900">
              {post.coverUrl ? (
                <Image
                  alt={post.title}
                  className="post-card__image object-cover"
                  fill
                  priority={index < 2}
                  sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 440px"
                  src={post.coverUrl}
                />
              ) : (
                <div aria-hidden className="post-card__fallback" />
              )}

              <div aria-hidden className="post-card__shade" />

              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-3xl"
                style={{ background: glare, opacity: glareOpacity }}
              />

              <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4 md:p-5">
                {post.isPinned ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2.5 py-1 text-[10px] font-semibold text-slate-950 shadow-sm">
                    <Pin aria-hidden="true" className="h-3 w-3" />
                    置顶
                  </span>
                ) : (
                  <span />
                )}

                {post.categoryTitle ? (
                  <span className="post-card__chip rounded-full border border-white/25 bg-slate-950/40 px-2.5 py-1 font-medium text-white/90 backdrop-blur-md">
                    {post.categoryTitle}
                  </span>
                ) : null}
              </div>

              <div className="post-card__content">
                <h3 className="post-card__title">{post.title}</h3>

                {post.description ? <p className="post-card__excerpt">{post.description}</p> : null}

                <div className="post-card__meta">
                  {post.publishedAtLabel ? <span>{post.publishedAtLabel}</span> : null}

                  <span className="inline-flex items-center gap-1">
                    <Clock aria-hidden="true" />
                    {post.readingTime || 1} 分钟
                  </span>

                  <span className="ml-auto inline-flex items-center gap-1">
                    <Eye aria-hidden="true" />
                    {post.views ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  )
}
