'use client'

import { X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Image from 'next/image'
import React, { useCallback, useId, useRef, useState } from 'react'

import type { AlbumData } from '../types'
import { pad2 } from '../utils'
import { DURATION, IMAGE_PERSPECTIVE } from './constants'
import {
  useFlipOrigin,
  useImageSizing,
  useLightboxKeyboard,
  useScrollLock,
  useTilt,
  useViewport,
} from './hooks'
import { LightboxMeta } from './LightboxMeta'
import { LightboxNav } from './LightboxNav'

type Props = {
  album: AlbumData
  index: number
  onClose: () => void
  onIndexChange: (index: number) => void
  /** 打开时缩略图的位置，用于「从卡片展开」的过渡 */
  sourceRect?: DOMRect | null
}

const EASE = [0.22, 0.61, 0.36, 1] as const

export const AlbumLightbox: React.FC<Props> = ({
  album,
  index,
  onClose,
  onIndexChange,
  sourceRect,
}) => {
  const reducedMotion = useReducedMotion() ?? false
  const total = album.photos.length
  const photo = album.photos[index]

  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [direction, setDirection] = useState(1)

  const viewport = useViewport()
  const sizing = useImageSizing(photo, viewport)
  const flip = useFlipOrigin(sourceRect, sizing, viewport)
  const { handlePointerMove, resetTilt, rotateX, rotateY } = useTilt({
    enabled: !reducedMotion,
    sizing,
    viewport,
  })

  const goTo = useCallback(
    (next: number) => {
      if (next === index || total < 1) return
      setDirection(next > index ? 1 : -1)
      onIndexChange(next)
    },
    [index, onIndexChange, total],
  )

  const goPrev = useCallback(() => {
    if (total < 2) return
    goTo((index - 1 + total) % total)
  }, [goTo, index, total])

  const goNext = useCallback(() => {
    if (total < 2) return
    goTo((index + 1) % total)
  }, [goTo, index, total])

  useScrollLock(closeRef)
  useLightboxKeyboard({ dialogRef, onClose, onNext: goNext, onPrev: goPrev })

  if (!photo) return null

  return (
    <motion.div
      animate={{ opacity: 1 }}
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-[90] overflow-hidden text-white"
      exit={{ opacity: 0 }}
      initial={false}
      onClick={onClose}
      onMouseLeave={resetTilt}
      onMouseMove={handlePointerMove}
      ref={dialogRef}
      role="dialog"
      transition={{ duration: reducedMotion ? DURATION.enterReduced : DURATION.close, ease: 'easeOut' }}
    >
      {/* 模糊常驻（opacity 动画期间浏览器会跳过 backdrop-filter），暗色单独淡入 */}
      <div aria-hidden className="absolute inset-0 backdrop-blur-xl" />
      <motion.div
        aria-hidden
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-slate-950/45 dark:bg-slate-950/30"
        initial={reducedMotion ? false : { opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : DURATION.scrim, ease: 'easeOut' }}
      />

      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4 sm:p-6">
        <div className="flex min-w-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12.5px] backdrop-blur-md">
          <span
            className="max-w-[46vw] truncate font-medium text-white/90 [text-shadow:0_1px_6px_rgba(0,0,0,.45)]"
            id={titleId}
          >
            {album.title}
          </span>
          <span aria-hidden className="h-0.5 w-0.5 shrink-0 rounded-full bg-white/45" />
          <span
            aria-live="polite"
            className="shrink-0 font-mono text-white/70 tabular-nums"
          >
            {pad2(index + 1)} / {pad2(total)}
          </span>
        </div>

        <button
          aria-label="关闭"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/85 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none"
          onClick={(event) => {
            event.stopPropagation()
            onClose()
          }}
          ref={closeRef}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence custom={direction} initial={false} mode="wait">
          {sizing ? (
            <motion.figure
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              className="relative m-0 flex flex-col items-center"
              custom={direction}
              exit={{
                opacity: 0,
                scale: reducedMotion ? 1 : 0.96,
                transition: { duration: reducedMotion ? 0.1 : 0.18, ease: 'easeIn' },
                x: reducedMotion ? 0 : direction * -24,
                y: 0,
              }}
              initial={
                flip
                  ? { opacity: 0.9, scale: flip.scale, x: flip.x, y: flip.y }
                  : { opacity: 0, scale: reducedMotion ? 1 : 0.92, x: 0, y: 12 }
              }
              key={photo.id}
              onClick={(event) => event.stopPropagation()}
              style={{ height: sizing.height, width: sizing.width }}
              transition={{
                duration: reducedMotion ? DURATION.enterReduced : flip ? DURATION.enterDesktop : 0.24,
                ease: EASE,
              }}
            >
              <motion.div
                className="h-full w-full"
                style={{
                  rotateX,
                  rotateY,
                  transformPerspective: IMAGE_PERSPECTIVE,
                  willChange: 'transform',
                }}
              >
                <Image
                  alt={photo.caption || `${album.title} 第 ${index + 1} 张`}
                  className="h-full w-full rounded-[6px] object-contain shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
                  height={photo.height || 1080}
                  priority
                  sizes="92vw"
                  src={photo.src}
                  width={photo.width || 1920}
                />
              </motion.div>
            </motion.figure>
          ) : null}
        </AnimatePresence>
      </div>

      <LightboxNav disabled={total < 2} onNext={goNext} onPrev={goPrev} />

      <LightboxMeta
        author={photo.author}
        reducedMotion={reducedMotion}
        source={photo.source}
      />
    </motion.div>
  )
}
