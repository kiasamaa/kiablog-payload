import Image from 'next/image'
import React from 'react'

export const SiteBackground: React.FC<{ imageUrl?: string | null }> = ({ imageUrl }) => {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {imageUrl ? (
        <Image
          alt=""
          className="h-full w-full object-cover opacity-30 dark:opacity-40"
          fill
          priority
          sizes="100vw"
          src={imageUrl}
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-b from-slate-100/90 via-slate-50/85 to-slate-200/95 dark:from-[#0F172A]/95 dark:via-[#0F172A]/90 dark:to-[#0B1120] " />

      <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-indigo-400/20 blur-[120px]" />
      <div className="absolute -right-24 top-40 h-96 w-96 rounded-full bg-sky-400/20 blur-[130px]" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-purple-400/10 blur-[120px]" />
    </div>
  )
}
