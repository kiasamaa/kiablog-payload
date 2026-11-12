import configPromise from '@payload-config'
import { type DataFromGlobalSlug, getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

import type { Config } from 'src/payload-types'

type Global = keyof Config['globals']

async function getGlobal<T extends Global>(slug: T, depth = 0): Promise<DataFromGlobalSlug<T>> {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
  })

  return global
}

/**
 * 生产环境用 `unstable_cache` 按 tag 缓存，后台保存时通过 `revalidateTag` 失效；
 * 开发环境禁用缓存，避免在后台（或导入脚本）改完数据后前台仍显示旧内容。
 */
export const getCachedGlobal = <T extends Global>(slug: T, depth = 0) => {
  if (process.env.NODE_ENV === 'development') {
    return () => getGlobal<T>(slug, depth)
  }

  return unstable_cache(async () => getGlobal<T>(slug, depth), [slug], {
    tags: [`global_${slug}`],
  })
}
