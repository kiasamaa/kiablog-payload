import type { Metadata } from 'next'
import { Geist, Geist_Mono, Noto_Serif_SC } from 'next/font/google'
import React from 'react'

import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { SiteBackground } from '@/components/layout/SiteBackground'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { cn } from '@/utilities/ui'

import './globals.css'
import 'highlight.js/styles/vs2015.css'

const geistSans = Geist({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

const notoSerifSC = Noto_Serif_SC({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-noto-serif-sc',
  weight: ['400', '700'],
})

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
  const settings = await getCachedGlobal('site-settings', 1)()
  const siteTitle = settings?.siteTitle || 'Kira Blog'
  const backgroundImage = settings?.backgroundImages?.[0]?.image
  const backgroundUrl =
    backgroundImage && typeof backgroundImage === 'object' ? getMediaUrl(backgroundImage.url) : undefined

  return (
    <html
      className={cn(geistSans.variable, geistMono.variable, notoSerifSC.variable)}
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
          <SiteBackground imageUrl={backgroundUrl} />
          <Navbar siteTitle={siteTitle} />
          <main className="flex-1 pt-16">{children}</main>
          <Footer
            footerText={settings?.footerText}
            icp={settings?.icp}
            siteTitle={siteTitle}
            socialLinks={settings?.socialLinks}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
