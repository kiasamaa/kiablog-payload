import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import React from 'react'

import { ContextMenu } from '@/components/layout/ContextMenu'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/nav/Navbar'
import { SiteBackground } from '@/components/layout/SiteBackground'
import { ReadingProvider } from '@/components/providers/ReadingProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { getNavData } from '@/utilities/getNavData'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { cn } from '@/utilities/ui'

import './globals.css'
import 'highlight.js/styles/vs2015.css'
import 'katex/dist/katex.min.css'

const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.add(t==='light'?'light':'dark');}catch(e){document.documentElement.classList.add('dark');}})();`

export const generateMetadata = async (): Promise<Metadata> => {
  const settings = await getCachedGlobal('site-settings', 1)()
  const siteTitle = settings?.siteTitle || 'Kira Blog'
  const description = settings?.siteDescription || settings?.bio || undefined

  return {
    metadataBase: new URL(getServerSideURL()),
    title: {
      default: siteTitle,
      template: `%s | ${siteTitle}`,
    },
    description,
    openGraph: mergeOpenGraph({
      description: description || '',
      siteName: siteTitle,
      title: siteTitle,
    }),
    twitter: {
      card: 'summary_large_image',
    },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, nav] = await Promise.all([getCachedGlobal('site-settings', 1)(), getNavData()])

  const siteTitle = settings?.siteTitle || 'Kira Blog'
  const backgroundImage = settings?.backgroundImages?.[0]?.image
  const backgroundUrl =
    backgroundImage && typeof backgroundImage === 'object' ? getMediaUrl(backgroundImage.url) : undefined

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable)}
      lang="zh-CN"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <ThemeProvider>
          <ReadingProvider>
            <SiteBackground imageUrl={backgroundUrl} />
            <Navbar
              categories={nav.categories}
              settings={settings}
              siteTitle={siteTitle}
              totalPosts={nav.total}
            />
            <ContextMenu />
            <main className="flex-1 pt-14">{children}</main>
            <Footer
              footerText={settings?.footerText}
              icp={settings?.icp}
              policeIcp={settings?.policeIcp}
              siteTitle={siteTitle}
              socialLinks={settings?.socialLinks}
            />
          </ReadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
