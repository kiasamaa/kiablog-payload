import type { CollectionBeforeChangeHook } from 'payload'

const FILE_EXTENSION = /\.[a-z0-9]{1,6}$/i

/**
 * 替代文本留空时，用文件名兜底。
 *
 * beforeChange 阶段 generateFileData 已经把 filename 写进 data，
 * 所以本地上传和外链下载都能拿到最终文件名；去掉扩展名后更适合读屏。
 */
export const fillAltFromFilename: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  const alt = typeof data.alt === 'string' ? data.alt.trim() : ''
  if (alt) return data

  // 新建时 filename 已由 generateFileData 写入 data；
  // 编辑时只提交变更字段，所以回退到原文档的 filename
  const originalFilename = (originalDoc as { filename?: unknown } | undefined)?.filename
  const filename =
    (typeof data.filename === 'string' && data.filename) ||
    (typeof originalFilename === 'string' && originalFilename) ||
    ''

  if (!filename) return data

  const withoutExtension = filename.replace(FILE_EXTENSION, '').trim()
  data.alt = withoutExtension || filename

  return data
}
