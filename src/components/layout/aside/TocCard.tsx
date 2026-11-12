'use client'

import { ListTree } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { cn } from '@/utilities/ui'

import { AsideCard } from './AsideCard'

type TocItem = {
  id: string
  text: string
  level: number
}

const toId = (text: string, index: number) => {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || `heading-${index}`
}

export const TocCard: React.FC = () => {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('main .prose h2, main .prose h3'),
    )

    if (nodes.length === 0) return

    const next = nodes.map((node, index) => {
      if (!node.id) {
        node.id = toId(node.textContent || '', index)
      }

      return {
        id: node.id,
        level: Number(node.tagName.slice(1)),
        text: (node.textContent || '').trim(),
      }
    })

    setItems(next)
    // 页面刚打开时可能还没有标题进入观察区，先默认高亮第一个
    setActiveId(next[0]?.id || '')

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible[0]) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-88px 0px -65% 0px', threshold: 0 },
    )

    nodes.forEach((node) => observer.observe(node))

    return () => observer.disconnect()
  }, [])

  const onJump = (id: string) => {
    const target = document.getElementById(id)

    if (!target) return

    const offset = target.getBoundingClientRect().top + window.scrollY - 80

    window.scrollTo({ behavior: 'smooth', top: Math.max(offset, 0) })
  }

  return (
    <AsideCard icon={ListTree} title="目录">
      {items.length === 0 ? (
        <p className="py-2 text-center text-[13px] text-slate-400 dark:text-slate-500">
          当前页面没有目录
        </p>
      ) : (
        /* 目录过长时自身滚动，保证整段吸附时下方的卡片仍能排进视口 */
        <ul className="max-h-[30vh] space-y-0.5 overflow-y-auto pr-1">
          {items.map((item) => {
            const active = item.id === activeId

            return (
              <li key={item.id}>
                <button
                  className={cn(
                    'block w-full truncate rounded-lg border-l-2 px-2.5 py-2 text-left text-[14px] transition-colors',
                    item.level === 3 && 'pl-4',
                    active
                      ? 'border-indigo-500 bg-indigo-500/10 font-medium text-indigo-600 dark:border-sky-400 dark:bg-sky-400/10 dark:text-sky-300'
                      : 'border-transparent text-slate-500 hover:bg-slate-900/[0.04] hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-slate-200',
                  )}
                  onClick={() => onJump(item.id)}
                  type="button"
                >
                  {item.text}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </AsideCard>
  )
}
