import Image from 'next/image'
import React from 'react'

export const SiteBackground: React.FC<{ imageUrl?: string | null }> = ({ imageUrl }) => {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {imageUrl ? (
        <Image
          alt=""
          className="h-full w-full object-cover opacity-25 dark:opacity-35"
          fill
          priority
          sizes="100vw"
          src={imageUrl}
        />
      ) : null}

      {/* 雾蓝底：浅色是极浅的天蓝过渡，深色是带一点蓝的墨色 */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50/92 via-blue-50/80 to-slate-100/95 dark:from-[#0B1220]/96 dark:via-[#0E1726]/94 dark:to-[#090F18]" />

      {/* 光斑：天蓝 + 蓝，第三个用淡青做一点点空气感 */}
      <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-sky-400/18 blur-[120px] dark:bg-sky-500/12" />
      <div className="absolute -right-24 top-40 h-96 w-96 rounded-full bg-blue-400/16 blur-[130px] dark:bg-blue-500/10" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-300/14 blur-[120px] dark:bg-cyan-500/8" />
    </div>
  )
}
