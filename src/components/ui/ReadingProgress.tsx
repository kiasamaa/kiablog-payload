'use client'

import React, { useEffect, useState } from 'react'

export const ReadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const height = document.documentElement.scrollHeight - window.innerHeight

      setProgress(height > 0 ? Math.min(100, Math.max(0, (scrollTop / height) * 100)) : 0)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="fixed inset-x-0 top-16 z-40 h-[3px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-purple-500 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
