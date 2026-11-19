import { useSpring, type MotionValue } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import type { AlbumPhoto } from '../types'
import {
  FRAME_PADDING,
  SMALL_VIEWPORT,
  TILT_MAX_DEG,
  TILT_SPRING,
  ratioOf,
} from './constants'

export type Viewport = { height: number; width: number }

export type ImageSizing = {
  /** 图片垂直中心（= 视口中心，图下方信息条已固定在底部，不参与布局） */
  centerY: number
  height: number
  width: number
}

export type FlipOrigin = { scale: number; x: number; y: number }

/** 浏览器里用 layout effect 抢在首次绘制前量到视口，避免灯箱闪一帧空白 */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export const useViewport = (): Viewport => {
  const [size, setSize] = useState<Viewport>({ height: 0, width: 0 })

  useIsomorphicLayoutEffect(() => {
    const update = () => setSize({ height: window.innerHeight, width: window.innerWidth })

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return size
}

/**
 * 按原比例把图片放进可用区域，并按倾斜后的外接框反算安全系数，
 * 保证任何倾角下四角都不会被视口裁掉。
 */
export const useImageSizing = (
  photo: AlbumPhoto | undefined,
  viewport: Viewport,
): ImageSizing | null =>
  useMemo(() => {
    if (!viewport.width || !photo) return null

    const padding = viewport.width < SMALL_VIEWPORT ? FRAME_PADDING.mobile : FRAME_PADDING.desktop
    const maxWidth = Math.max(120, viewport.width - padding.x)
    const maxHeight = Math.max(120, viewport.height - padding.top - padding.bottom)
    const ratio = ratioOf(photo)

    let width = maxWidth
    let height = width / ratio

    if (height > maxHeight) {
      height = maxHeight
      width = height * ratio
    }

    const rad = (TILT_MAX_DEG * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const safeScale = Math.min(
      maxWidth / (width * cos + height * sin),
      maxHeight / (height * cos + width * sin),
      1,
    )

    return {
      centerY: viewport.height / 2,
      height: Math.round(height * safeScale),
      width: Math.round(width * safeScale),
    }
  }, [photo, viewport.height, viewport.width])

/** 从缩略图位置展开的初始位移与缩放（FLIP） */
export const useFlipOrigin = (
  sourceRect: DOMRect | null | undefined,
  sizing: ImageSizing | null,
  viewport: Viewport,
): FlipOrigin | null =>
  useMemo(() => {
    if (!sourceRect || !sizing || !viewport.width) return null

    return {
      scale: Math.max(0.08, Math.min(sourceRect.width / sizing.width, 1)),
      x: sourceRect.left + sourceRect.width / 2 - viewport.width / 2,
      y: sourceRect.top + sourceRect.height / 2 - sizing.centerY,
    }
  }, [sizing, sourceRect, viewport.width])

/**
 * 指针在整个灯箱内移动都会带动倾斜：以图片中心为原点、按半屏归一化。
 * 靠近指针的一侧向后（视觉上向下/向内），对侧向前凸起。
 */
export const useTilt = (options: {
  enabled: boolean
  sizing: ImageSizing | null
  viewport: Viewport
}): {
  resetTilt: () => void
  rotateX: MotionValue<number>
  rotateY: MotionValue<number>
  handlePointerMove: (event: React.MouseEvent<HTMLElement>) => void
} => {
  const { enabled, sizing, viewport } = options
  const rotateX = useSpring(0, TILT_SPRING)
  const rotateY = useSpring(0, TILT_SPRING)

  const handlePointerMove = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!enabled || !sizing || !viewport.width) return

      const offsetX = (event.clientX - viewport.width / 2) / Math.max(1, viewport.width / 2)
      const offsetY = (event.clientY - sizing.centerY) / Math.max(1, viewport.height / 2)
      const clamp = (value: number) => Math.max(-1, Math.min(1, value))

      rotateY.set(clamp(offsetX) * TILT_MAX_DEG)
      rotateX.set(clamp(-offsetY) * TILT_MAX_DEG)
    },
    [enabled, rotateX, rotateY, sizing, viewport.height, viewport.width],
  )

  const resetTilt = useCallback(() => {
    rotateX.set(0)
    rotateY.set(0)
  }, [rotateX, rotateY])

  // 用户中途开启「减少动态效果」时，立刻回正
  useEffect(() => {
    if (enabled) return
    rotateX.set(0)
    rotateY.set(0)
  }, [enabled, rotateX, rotateY])

  return { handlePointerMove, resetTilt, rotateX, rotateY }
}

/** 锁定页面滚动，并把焦点移到灯箱内、关闭时还给触发元素 */
export const useScrollLock = (focusRef: React.RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    const frame = requestAnimationFrame(() => focusRef.current?.focus())

    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      previous?.focus?.()
    }
  }, [focusRef])
}

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'

/** Esc 关闭、←/→ 切换、Tab 在对话框内循环 */
export const useLightboxKeyboard = (options: {
  dialogRef: React.RefObject<HTMLDivElement | null>
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}) => {
  const { dialogRef, onClose, onNext, onPrev } = options

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onPrev()
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        onNext()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.getClientRects().length > 0,
      )

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
  }, [dialogRef, onClose, onNext, onPrev])
}
