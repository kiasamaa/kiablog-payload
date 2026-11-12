import { MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import React from 'react'

import { SiteProfile } from '@/components/site/SiteProfile'
import { getCachedGlobal } from '@/utilities/getGlobals'

export const metadata: Metadata = {
  title: '关于',
}

export default async function AboutPage() {
  const [settings, about] = await Promise.all([
    getCachedGlobal('site-settings', 1)(),
    getCachedGlobal('about', 1)(),
  ])

  const paragraphs = (about?.intro || '').split('\n').filter(Boolean)
  const gears = about?.gears ?? []
  const hobbies = about?.hobbies ?? []

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <header className="mb-8 md:mb-12">
        <h1 className="font-serif text-2xl font-bold text-slate-800 md:text-3xl dark:text-slate-50">
          关于
        </h1>
        <p className="mt-2 text-sm text-slate-500 md:text-base dark:text-slate-400">
          关于我、我的装备，以及一些正在坚持的小事。
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        <SiteProfile
          className="md:col-span-2"
          description={
            paragraphs.length > 0
              ? paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
              : undefined
          }
          settings={settings}
          variant="card"
        />

        <div className="glass-card flex flex-col justify-between rounded-3xl p-7">
          <span className="text-[11px] font-medium tracking-[0.3em] text-indigo-500 uppercase dark:text-sky-300">
            Motto
          </span>
          <p className="mt-8 font-serif text-xl leading-relaxed text-slate-800 dark:text-slate-100">
            {about?.motto || '天天开心！'}
          </p>
        </div>

        <div className="glass-card relative min-h-[220px] overflow-hidden rounded-3xl">
          {about?.locationImageUrl ? (
            <Image
              alt=""
              className="object-cover opacity-75"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              src={about.locationImageUrl}
            />
          ) : null}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="text-[11px] tracking-[0.2em] text-white/70 uppercase">我的位置</p>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              {about?.locationPlace || '暂未填写'}
            </p>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-7 md:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">我的装备</h3>

          {gears.length > 0 ? (
            <ul className="mt-4 divide-y divide-white/25 dark:divide-white/10">
              {gears.map((gear, index) => (
                <li
                  className="flex items-center justify-between gap-4 py-2.5 text-sm"
                  key={`${gear.date}-${gear.model}-${index}`}
                >
                  <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                    {gear.date}
                  </span>
                  <span className="text-right text-slate-700 dark:text-slate-300">
                    {gear.model}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">还没有填写装备信息。</p>
          )}
        </div>

        {hobbies.length > 0 ? (
          <div className="md:col-span-3">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {hobbies.map((hobby) => (
                <div className="glass-card rounded-3xl p-6" key={hobby.id || hobby.label}>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {hobby.label}
                  </p>

                  <div className="mt-4 space-y-3">
                    {(hobby.slides ?? []).map((slide, index) => (
                      <div key={`${hobby.label}-${slide.title}-${index}`}>
                        {slide.title ? (
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {slide.title}
                          </p>
                        ) : null}
                        {slide.text ? (
                          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                            {slide.text}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
