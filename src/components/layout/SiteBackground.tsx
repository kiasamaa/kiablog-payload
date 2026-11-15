'use client'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'

import { applyBackgroundSettings, getBackgroundSettings } from '@/utilities/backgroundPreferences'

/**
 * 站点背景：背景图（可切图/模糊/调透明度）+ 雾蓝渐变 + 三团光斑。
 * 偏好写在 <html> 的 CSS 变量/dataset 上，首屏脚本会在绘制前恢复；
 * 这里只负责“切到哪张图”，以及保证 React 侧也能及时响应设置变化。
 */
export const SiteBackground: React.FC<{ images?: string[] }> = ({ images = [] }) => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const read = () => {
      const settings = getBackgroundSettings()
      setIndex(images.length > 0 ? Math.min(settings.index, images.length - 1) : 0)
    }

    applyBackgroundSettings(getBackgroundSettings())
    read()

    window.addEventListener('background-settings', read)

    return () => window.removeEventListener('background-settings', read)
  }, [images.length])

  const imageUrl = images[index] || images[0]

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {imageUrl ? (
        <Image
          alt=""
          className="site-bg__image h-full w-full object-cover"
          fill
          priority
          sizes="100vw"
          src={imageUrl}
        />
      ) : null}

      {/* 比之前更透的白色/夜色薄纱：让背景图看得见，同时保证文字可读 */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/12 to-white/35 dark:from-[#0B1220]/70 dark:via-[#0E1726]/45 dark:to-[#090F18]/65" />

      {/* 光斑：天蓝 + 蓝 + 淡青 */}
      <div className="site-bg__glow absolute -left-32 top-10 h-80 w-80 rounded-full bg-sky-400/18 blur-[120px] dark:bg-sky-500/12" />
      <div className="site-bg__glow absolute -right-24 top-40 h-96 w-96 rounded-full bg-blue-400/16 blur-[130px] dark:bg-blue-500/10" />
      <div className="site-bg__glow absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-300/14 blur-[120px] dark:bg-cyan-500/8" />
    </div>
  )
}
