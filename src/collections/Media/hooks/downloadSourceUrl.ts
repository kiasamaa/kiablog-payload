import type { CollectionBeforeOperationHook } from 'payload'
import { APIError } from 'payload'

import { fetchRemoteImage, parseUrl } from '@/endpoints/media/importFromUrl'

/**
 * 创建媒体记录时，如果用户没有选择本地文件、只填了外链，
 * 就在写库前把外链图片下载下来，作为这条记录的文件。
 *
 * 该 hook 运行在 generateFileData 之前，赋值 req.file 会被后续的上传流程接住，
 * 因此尺寸裁剪、文件名、存储路径等全部沿用 Payload 原生逻辑。
 */
export const downloadSourceUrlOnCreate: CollectionBeforeOperationHook = async ({
  args,
  operation,
  req,
}) => {
  if (operation !== 'create' || req.file) return

  const data = (args?.data ?? {}) as Record<string, unknown>
  const sourceUrl = typeof data.sourceUrl === 'string' ? data.sourceUrl.trim() : ''

  if (!sourceUrl) {
    throw new APIError('请上传图片文件，或填写要下载到本地的外链地址', 400)
  }

  const target = parseUrl(sourceUrl)
  const { buffer, mime, name } = await fetchRemoteImage(target)

  req.file = {
    data: buffer,
    mimetype: mime,
    name,
    size: buffer.byteLength,
  }
}
