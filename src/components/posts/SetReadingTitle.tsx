'use client'

import React, { useEffect } from 'react'

import { useReading } from '@/components/providers/ReadingProvider'

/** 把当前文章标题写进导航中间的信息位，离开页面时清空 */
export const SetReadingTitle: React.FC<{ title: string }> = ({ title }) => {
  const { setReadingTitle } = useReading()

  useEffect(() => {
    setReadingTitle(title)

    return () => setReadingTitle('')
  }, [title, setReadingTitle])

  return null
}
