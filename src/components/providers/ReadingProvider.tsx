'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'

type ReadingContextValue = {
  readingTitle: string
  setReadingTitle: (title: string) => void
}

const ReadingContext = createContext<ReadingContextValue>({
  readingTitle: '',
  setReadingTitle: () => {},
})

export const ReadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [readingTitle, setReadingTitle] = useState('')

  const value = useMemo(() => ({ readingTitle, setReadingTitle }), [readingTitle])

  return <ReadingContext.Provider value={value}>{children}</ReadingContext.Provider>
}

export const useReading = () => useContext(ReadingContext)
