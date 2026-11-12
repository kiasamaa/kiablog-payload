'use client'

import React, { useEffect, useState } from 'react'

import type { SiteSetting } from '@/payload-types'
import type { AsidePostItem, SeriesAsideData } from '@/utilities/getAsideData'
import type { SiteStats } from '@/utilities/getSiteStats'
import { getAsideHidden } from '@/utilities/preferences'
import { cn } from '@/utilities/ui'

import { HotPostsCard, RecentCard, SeriesCard, SiteCard, StatsCard, TagsCard } from './cards'
import type { AsideVariant } from './config'
import { TocCard } from './TocCard'

type Props = {
  variant: AsideVariant
  settings: SiteSetting | null
  stats: SiteStats
  recent?: AsidePostItem[]
  hot?: AsidePostItem[]
  series?: SeriesAsideData | null
  currentSlug?: string
}

export const Aside: React.FC<Props> = ({
  variant,
  settings,
  stats,
  recent = [],
  hot = [],
  series,
  currentSlug,
}) => {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    setHidden(getAsideHidden())

    const onToggle = (event: Event) => {
      const detail = (event as CustomEvent<{ hidden: boolean }>).detail

      setHidden(Boolean(detail?.hidden))
    }

    window.addEventListener('aside-toggle', onToggle)

    return () => window.removeEventListener('aside-toggle', onToggle)
  }, [])

  return (
    <aside
      className={cn('hidden w-[280px] shrink-0 xl:block', hidden && 'xl:hidden')}
      data-aside-variant={variant}
    >
      {/* 站点卡随页面滚走，锚定卡片吸附在导航下方，侧栏本身不产生滚动条 */}
      <SiteCard settings={settings} />

      {/*
        站点卡随页面滚走；从锚定卡片开始整段吸附（含其后的卡片），
        直接挂在 aside 下，父容器高度等于全文高度，滚到页面底部才会被推走。
      */}
      <div className="sticky top-20 mt-3 space-y-3">
        {variant === 'posts-list' ? (
          <>
            <HotPostsCard posts={hot} />
            <TagsCard tags={stats.tagStats} />
            <StatsCard stats={stats} />
          </>
        ) : (
          <>
            <TocCard />
            {series ? <SeriesCard currentSlug={currentSlug || ''} data={series} /> : null}
            <RecentCard posts={recent} />
          </>
        )}
      </div>
    </aside>
  )
}
