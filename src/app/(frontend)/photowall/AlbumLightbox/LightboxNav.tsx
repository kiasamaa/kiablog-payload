'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'

type Props = {
  disabled: boolean
  onNext: () => void
  onPrev: () => void
}

/** 移动端放到底部两侧，避免压住图片；桌面端回到垂直居中 */
const NAV_BUTTON =
  'absolute z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/85 backdrop-blur-md transition-colors hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-25'

export const LightboxNav: React.FC<Props> = ({ disabled, onNext, onPrev }) => (
  <>
    <button
      aria-label="上一张"
      className={`${NAV_BUTTON} bottom-4 left-4 sm:top-1/2 sm:bottom-auto sm:left-8 sm:-translate-y-1/2`}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onPrev()
      }}
      type="button"
    >
      <ChevronLeft className="h-5 w-5" />
    </button>

    <button
      aria-label="下一张"
      className={`${NAV_BUTTON} right-4 bottom-4 sm:top-1/2 sm:right-8 sm:bottom-auto sm:-translate-y-1/2`}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onNext()
      }}
      type="button"
    >
      <ChevronRight className="h-5 w-5" />
    </button>
  </>
)
