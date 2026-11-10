'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'

import { cn } from '@/utilities/ui'

export type LightboxImage = {
  src: string
  caption?: string | null
}

type Props = {
  images: LightboxImage[]
  initialIndex?: number
  onClose: () => void
}

export const Lightbox: React.FC<Props> = ({ images, initialIndex = 0, onClose }) => {
  const [index, setIndex] = useState(initialIndex)
  const total = images.length

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + total) % total)
  }, [total])

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % total)
  }, [total])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') goPrev()
      if (event.key === 'ArrowRight') goNext()
    }

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [goNext, goPrev, onClose])

  const current = images[index]

  if (!current) return null

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[80] flex flex-col bg-black/92 backdrop-blur-sm"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        onClick={onClose}
        role="dialog"
      >
        <div className="flex items-center justify-between px-4 py-3 text-white/80">
          <span className="text-xs">
            {index + 1} / {total}
          </span>

          <button
            aria-label="关闭"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className="relative flex flex-1 items-center justify-center px-4 pb-4"
          onClick={(event) => event.stopPropagation()}
        >
          {total > 1 ? (
            <button
              aria-label="上一张"
              className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:left-6"
              onClick={goPrev}
              type="button"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : null}

          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-h-full w-full max-w-5xl"
            initial={{ opacity: 0, scale: 0.98 }}
            key={current.src}
          >
            <Image
              alt={current.caption || '照片'}
              className="mx-auto h-auto max-h-[75vh] w-auto rounded-xl object-contain"
              height={1080}
              src={current.src}
              width={1920}
            />
            {current.caption ? (
              <p className="mt-3 text-center text-xs text-white/70">{current.caption}</p>
            ) : null}
          </motion.div>

          {total > 1 ? (
            <button
              aria-label="下一张"
              className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:right-6"
              onClick={goNext}
              type="button"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        {total > 1 ? (
          <div
            className="flex justify-center gap-2 overflow-x-auto px-4 pb-5"
            onClick={(event) => event.stopPropagation()}
          >
            {images.map((image, imageIndex) => (
              <button
                aria-label={`查看第 ${imageIndex + 1} 张`}
                className={cn(
                  'relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition-all',
                  imageIndex === index
                    ? 'border-white opacity-100'
                    : 'border-transparent opacity-50 hover:opacity-80',
                )}
                key={`${image.src}-${imageIndex}`}
                onClick={() => setIndex(imageIndex)}
                type="button"
              >
                <Image alt="" className="object-cover" fill sizes="80px" src={image.src} />
              </button>
            ))}
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  )
}
