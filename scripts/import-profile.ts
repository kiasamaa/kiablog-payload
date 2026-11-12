import 'dotenv/config'

import path from 'node:path'

import { getPayload } from 'payload'

import config from '../src/payload.config'

const AVATAR_PATH = path.resolve(process.cwd(), 'public/images/avatar.jpg')

const siteSettings = {
  authorName: 'KIASAMA',
  bio: '这是我倾心打造的个人网站，内容涉及生活、游戏、开发等。',
  footerText: '天天开心！',
  icp: '湘ICP备2025107098号-1',
  policeIcp: '湘公网安备43011102002501号',
  siteDescription: 'KIASAMA 的个人网站，记录生活、游戏与开发。',
  siteStartedAt: '2025-02-28T00:00:00.000Z',
  siteTitle: 'KIASite',
  socialLinks: [
    { label: 'Email', url: 'mailto:469200612@qq.com' },
    { label: 'Bilibili', url: 'https://space.bilibili.com/29341895' },
  ],
}

const about = {
  gears: [
    { date: '2022-02', model: '联想 拯救者 R9000P' },
    { date: '2025-02', model: 'AMD 9700X / AMD Radeon RX 7900 XT' },
    { date: '2024-12', model: 'XIAOMI 15' },
    { date: '2024-12', model: 'SoncieMeory 声音记忆 G50' },
    { date: '2026-05', model: '水月雨 太空漫游 2 Ultra' },
  ],
  intro:
    '这是我倾心打造的个人网站，内容涉及生活、游戏、开发等\n希望你可以在这里收获知识和快乐！',
  locationImageUrl: '/images/location.png',
  locationPlace: '湖南省，长沙市',
  motto: '天天开心！',
}

const getOrCreateAvatar = async (payload: Awaited<ReturnType<typeof getPayload>>) => {
  const existing = await payload.find({
    collection: 'media',
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { filename: { equals: 'avatar.jpg' } },
  })

  if (existing.docs[0]) return existing.docs[0].id

  const media = await payload.create({
    collection: 'media',
    context: { disableRevalidate: true },
    data: { alt: 'KIASAMA 头像' },
    filePath: AVATAR_PATH,
    overrideAccess: true,
  })

  return media.id
}

const run = async () => {
  const payload = await getPayload({ config })

  const avatarID = await getOrCreateAvatar(payload)

  await payload.updateGlobal({
    slug: 'site-settings',
    context: { disableRevalidate: true },
    data: { ...siteSettings, avatar: avatarID },
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'about',
    context: { disableRevalidate: true },
    data: about,
    overrideAccess: true,
  })

  payload.logger.info('Site settings and about page are ready.')
  process.exit(0)
}

void run()
