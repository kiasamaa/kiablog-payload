import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { zh } from '@payloadcms/translations/languages/zh'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Albums } from './collections/Albums'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Photos } from './collections/Photos'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { defaultLexical } from '@/fields/defaultLexical'
import { About } from './globals/About/config'
import { SiteSettings } from './globals/SiteSettings/config'
import { plugins } from './plugins'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    meta: {
      titleSuffix: ' · 站点管理',
      description: 'KIASite 内容管理后台',
      icons: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          url: '/favicon.svg',
        },
      ],
    },
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: '手机',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: '平板',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: '桌面',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  editor: defaultLexical,
  i18n: {
    supportedLanguages: { zh },
    fallbackLanguage: 'zh',
    // 重定向插件只自带 en/es 等语言，这里补一份中文，避免后台出现 translation key 原文
    translations: {
      zh: {
        'plugin-redirects': {
          customUrl: '自定义链接',
          documentToRedirect: '选择要跳转的文档',
          fromUrl: '来源路径',
          internalLink: '站内文档',
          redirectType: '跳转类型',
          toUrlType: '目标类型',
        },
      },
    },
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
  }),
  collections: [Posts, Categories, Albums, Photos, Media, Users],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [SiteSettings, About],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
