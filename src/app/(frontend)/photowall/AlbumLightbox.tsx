'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import type { AlbumData } from './types'

type Props = {
  album: AlbumData
  index: number
  onClose: () => void
  onIndexChange: (index: number) => void
}

const pad = (value: number) => String(value).padStart(2, '0')

export const AlbumLightbox: React.FC<Props> = ({ album, index, onClose, onIndexChange }) => {
  const reducedMotion = useReducedMotion() ?? false
  const total = album.photos.length
  const photo = album.photos[index]
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [direction, setDirection] = useState(1)

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

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    const frame = requestAnimationFrame(() => closeRef.current?.focus())

    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      previous?.focus?.()
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goPrev()
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goNext()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0)

      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goNext, goPrev, onClose])

  if (!photo) return null

  return (
    <motion.div
      animate={{ opacity: 1 }}
      aria-label="查看照片"
      aria-modal="true"
      className="fixed inset-0 z-[90] overflow-hidden bg-[#05090f] text-white"
      exit={{ opacity: 0 }}
      initial={reducedMotion ? false : { opacity: 0 }}
      onClick={onClose}
      ref={dialogRef}
      role="dialog"
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <Image
          alt=""
          aria-hidden
          className="scale-110 object-cover opacity-50 blur-3xl"
          fill
          priority
          sizes="100vw"
          src={photo.src}
        />
        <div className="absolute inset-0 bg-[#05090f]/65" />
      </div>

      <button
        aria-label="关闭"
        className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/45 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
        onClick={(event) => {
          event.stopPropagation()
          onClose()
        }}
        ref={closeRef}
        type="button"
      >
        <X className="h-4 w-4" />
      </button>

      <button
        aria-label="上一张"
        className="absolute top-1/2 left-3 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-slate-950/30 text-white/75 backdrop-blur-md transition-colors hover:bg-slate-950/60 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none disabled:opacity-30 sm:left-6"
        disabled={total < 2}
        onClick={(event) => {
          event.stopPropagation()
          goPrev()
        }}
        type="button"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <AnimatePresence custom={direction} initial={false} mode="wait">
        <motion.figure
          animate={{ opacity: 1, scale: 1, x: 0 }}
          className="absolute inset-0 flex items-center justify-center px-3 pb-9 sm:px-14"
          custom={direction}
          exit={{
            opacity: 0,
            scale: reducedMotion ? 1 : 0.985,
            x: reducedMotion ? 0 : direction * -18,
          }}
          initial={{
            opacity: 0,
            scale: reducedMotion ? 1 : 0.985,
            x: reducedMotion ? 0 : direction * 18,
          }}
          key={photo.id}
          transition={{ duration: reducedMotion ? 0.12 : 0.24, ease: 'easeOut' }}
        >
          <Image
            alt={photo.caption || `${album.title} 第 ${index + 1} 张`}
            className="h-auto max-h-[calc(100vh-52px)] w-auto max-w-[96vw] rounded-[5px] object-contain shadow-[0_30px_90px_-30px_rgba(0,0,0,0.95)] sm:max-w-[calc(100vw-112px)]"
            height={photo.height || 1080}
            onClick={(event) => event.stopPropagation()}
            priority
            sizes="96vw"
            src={photo.src}
            width={photo.width || 1920}
          />
        </motion.figure>
      </AnimatePresence>

      <button
        aria-label="下一张"
        className="absolute top-1/2 right-3 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-slate-950/30 text-white/75 backdrop-blur-md transition-colors hover:bg-slate-950/60 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none disabled:opacity-30 sm:right-6"
        disabled={total < 2}
        onClick={(event) => {
          event.stopPropagation()
          goNext()
        }}
        type="button"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/65 to-transparent" />

      <div className="pointer-events-none absolute bottom-3 left-1/2 flex max-w-[calc(100vw-140px)] -translate-x-1/2 items-center justify-center gap-2.5 text-center whitespace-nowrap">
        <span className="truncate text-[14px] font-medium text-white/90">{album.title}</span>
        {photo.caption ? (
          <>
            <span className="h-0.5 w-0.5 shrink-0 rounded-full bg-white/35" />
            <span className="max-w-[40vw] truncate text-[14px] text-white/65">{photo.caption}</span>
          </>
        ) : null}
        <span className="h-0.5 w-0.5 shrink-0 rounded-full bg-white/35" />
        <span className="font-mono text-[13px] text-white/55">
          {pad(index + 1)} / {pad(total)}
        </span>
      </div>
    </motion.div>
  )
}
