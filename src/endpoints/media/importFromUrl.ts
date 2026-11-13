import type { Endpoint, Payload, PayloadRequest } from 'payload'

import type { Media } from '@/payload-types'

/** 单张图片允许的最大体积 */
const MAX_BYTES = 20 * 1024 * 1024
/** 网络请求超时 */
const TIMEOUT_MS = 15_000
/** 最多跟随的重定向次数 */
const MAX_REDIRECTS = 3

/** 只接受能交给 sharp 处理的常见位图格式，SVG 一律拒绝（可内嵌脚本） */
const EXT_BY_MIME: Record<string, string> = {
  'image/avif': '.avif',
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

/** 明显指向内网/本机的主机名，避免这个接口被用来探测内网服务 */
const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^\[?::1\]?$/,
  /^\[?f[cd][0-9a-f]{2}:/i,
]

export type ImportImageInput = {
  alt?: string
  author?: string
  source?: string
  url?: string
}

const fail = (message: string, status = 400) => Response.json({ message }, { status })

export const parseUrl = (raw: unknown): URL => {
  if (typeof raw !== 'string' || !raw.trim()) throw new Error('请填写图片链接')
  let parsed: URL
  try {
    parsed = new URL(raw.trim())
  } catch {
    throw new Error('链接格式不正确，需要以 http:// 或 https:// 开头')
  }
  if (!/^https?:$/.test(parsed.protocol)) throw new Error('只支持 http/https 链接')
  if (PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(parsed.hostname))) {
    throw new Error('不支持内网或本机地址')
  }
  return parsed
}

const sanitizeFileName = (url: URL, mime: string): string => {
  let last = ''
  try {
    last = decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || '')
  } catch {
    last = url.pathname.split('/').pop() || ''
  }

  const cleaned = last.replace(/[^\w.\-]/g, '_').replace(/_+/g, '_').slice(0, 80)
  const ext = EXT_BY_MIME[mime] ?? ''

  if (!cleaned) return `remote-${Date.now()}${ext}`
  if (/\.[a-z0-9]{2,5}$/i.test(cleaned)) return cleaned
  return `${cleaned}${ext}`
}

/**
 * 下载远程图片并校验体积/格式，返回可直接写入上传集合的文件数据。
 * 同时供 endpoint 和创建记录前的 hook 复用。
 */
export const fetchRemoteImage = async (
  start: URL,
): Promise<{ buffer: Buffer; mime: string; name: string }> => {
  let current = start

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    let response: Response
    try {
      response = await fetch(current, {
        // 手动跟随重定向，每一跳都重新做一次内网校验
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          Accept: 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8',
          // 部分图床会做简单的 Referer 防盗链，带上站点来源才能取到原图
          Referer: process.env.NEXT_PUBLIC_SERVER_URL || current.origin,
          'User-Agent': 'Mozilla/5.0 (compatible; KIASiteMediaImporter/1.0)',
        },
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('下载超时，请确认链接可访问')
      }
      throw new Error('无法访问该链接，请确认地址正确且可外网访问')
    } finally {
      clearTimeout(timer)
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location) throw new Error('链接重定向异常')
      current = parseUrl(new URL(location, current).toString())
      continue
    }

    if (!response.ok) {
      throw new Error(`下载失败（HTTP ${response.status}），请确认链接是否需要鉴权`)
    }

    const contentLength = Number(response.headers.get('content-length') || 0)
    if (contentLength > MAX_BYTES) {
      throw new Error(`图片超过 ${Math.floor(MAX_BYTES / 1024 / 1024)}MB 上限`)
    }

    const mime = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
    if (!EXT_BY_MIME[mime]) {
      throw new Error('该链接不是受支持的图片格式（支持 jpg/png/webp/avif/gif）')
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    if (buffer.byteLength === 0) throw new Error('下载到的文件为空')
    if (buffer.byteLength > MAX_BYTES) {
      throw new Error(`图片超过 ${Math.floor(MAX_BYTES / 1024 / 1024)}MB 上限`)
    }

    return { buffer, mime, name: sanitizeFileName(current, mime) }
  }

  throw new Error('重定向次数过多')
}

/**
 * 把外链图片下载下来，作为本地媒体记录保存。
 * 抽成独立函数，便于脚本/测试直接调用，不必经过 HTTP 鉴权。
 */
export const importImageFromUrl = async ({
  input,
  payload,
  req,
}: {
  input: ImportImageInput
  payload: Payload
  req?: PayloadRequest
}): Promise<Media> => {
  const target = parseUrl(input.url)
  const { buffer, mime, name } = await fetchRemoteImage(target)

  const alt = input.alt?.trim() || name
  const author = input.author?.trim() || undefined
  const source = input.source?.trim() || undefined

  return payload.create({
    collection: 'media',
    data: {
      alt,
      author,
      source,
      // 记录原始外链，前台展示和重新下载都以它为准
      sourceUrl: target.toString(),
    },
    file: {
      data: buffer,
      mimetype: mime,
      name,
      size: buffer.byteLength,
    },
    // 让集合的 access 生效，而不是用本地 API 的默认越权
    overrideAccess: false,
    req,
  })
}

export const importImageFromUrlEndpoint: Endpoint = {
  path: '/import-from-url',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    if (!req.user) return fail('请先登录后台', 401)

    let body: ImportImageInput
    try {
      body = ((await req.json?.()) ?? {}) as ImportImageInput
    } catch {
      return fail('请求内容不是合法的 JSON')
    }

    try {
      const doc = await importImageFromUrl({ input: body, payload: req.payload, req })
      // 返回完整文档：调用方（相册页）需要 width/height/sizes 来定方向和缩略图
      return Response.json({ doc })
    } catch (error) {
      req.payload.logger.error({ err: error, msg: '从外链导入图片失败' })
      return fail(error instanceof Error ? error.message : '导入失败')
    }
  },
}
