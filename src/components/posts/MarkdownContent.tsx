'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Lightbox } from '@/components/ui/Lightbox'
import { cn } from '@/utilities/ui'

type Props = {
  html: string
  className?: string
}

export const MarkdownContent: React.FC<Props> = ({ html, className }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  useEffect(() => {
    const root = containerRef.current

    if (!root) return

    const cleanups: (() => void)[] = []

    root.querySelectorAll('pre').forEach((pre) => {
      if (pre.querySelector('.code-copy-button')) return

      pre.style.position = 'relative'

      const button = document.createElement('button')
      button.className = 'code-copy-button'
      button.textContent = '复制'
      button.type = 'button'

      const onCopy = () => {
        const code = pre.querySelector('code')?.textContent || ''

        if (!navigator.clipboard?.writeText) {
          console.error('当前环境不支持剪贴板 API')
          return
        }

        void navigator.clipboard.writeText(code).then(() => {
          button.textContent = '已复制'
          window.setTimeout(() => {
            button.textContent = '复制'
          }, 1500)
        })
      }

      button.addEventListener('click', onCopy)
      pre.appendChild(button)
      cleanups.push(() => {
        button.removeEventListener('click', onCopy)
        button.remove()
      })
    })

    return () => cleanups.forEach((cleanup) => cleanup())
  }, [html])

  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement

    if (target.tagName === 'IMG') {
      setLightboxSrc((target as HTMLImageElement).currentSrc || (target as HTMLImageElement).src)
    }
  }, [])

  return (
    <>
      <div
        className={cn(
          'prose prose-slate max-w-none md:prose-md dark:prose-invert',
          'prose-headings:font-serif prose-headings:tracking-tight',
          'prose-a:text-indigo-600 dark:prose-a:text-sky-300',
          className,
        )}
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={handleClick}
        ref={containerRef}
      />

      {lightboxSrc ? (
        <Lightbox images={[{ caption: null, src: lightboxSrc }]} onClose={() => setLightboxSrc(null)} />
      ) : null}
    </>
  )
}
