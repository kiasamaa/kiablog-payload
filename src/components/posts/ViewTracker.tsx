'use client'

import React, { useEffect } from 'react'

import { incrementPostViews } from '@/app/actions/views'

const VIEW_TTL = 12 * 60 * 60 * 1000

/** 同一个浏览器 12 小时内只记一次浏览量 */
export const ViewTracker: React.FC<{ slug: string }> = ({ slug }) => {
  useEffect(() => {
    const key = `nb-viewed:${slug}`
    const last = Number(window.localStorage.getItem(key) || 0)

    if (Number.isFinite(last) && last > 0 && Date.now() - last < VIEW_TTL) return

    window.localStorage.setItem(key, String(Date.now()))
    void incrementPostViews(slug)
  }, [slug])

  return null
}
