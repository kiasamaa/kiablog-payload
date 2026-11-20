import { slugField } from 'payload'
import type { CollectionSlug, TextFieldSingleValidation } from 'payload'

type SlugFieldOptions = Parameters<typeof slugField>[0]

/**
 * 检查 slug 在同一集合内是否已被占用。
 * 只在提交时查库，避免解锁后每次按键都发请求；数据库 unique 索引作为兜底。
 */
const createSlugValidator = (collectionSlug: CollectionSlug): TextFieldSingleValidation =>
  async (value, { event, id, req }) => {
    if (!value) return true
    if (event && event !== 'submit') return true
    if (!req?.payload?.find) return true

    try {
      const { docs } = await req.payload.find({
        collection: collectionSlug,
        depth: 0,
        limit: 1,
        req,
        where: {
          slug: { equals: value },
          ...(id ? { id: { not_equals: id } } : {}),
        },
      })

      return docs.length > 0 ? '该路径已被使用，请换一个' : true
    } catch {
      // 校验服务异常时不阻断保存，数据库的 unique 索引仍会兜底
      return true
    }
  }

/**
 * 中文版 slugField。
 * Payload 内置的 slug 字段会把标签写成英文的 Generate Slug / Slug，
 * 这里统一替换为中文，并补上人工解锁后的重复校验，其余行为与官方一致。
 */
export const chineseSlugField = (
  collectionSlug: CollectionSlug,
  options: SlugFieldOptions = {},
) =>
  slugField({
    ...options,
    overrides: (field) => {
      const controls = field.fields as unknown as {
        label?: string
        validate?: TextFieldSingleValidation
      }[]
      const [generateCheckbox, slugInput] = controls

      if (generateCheckbox) generateCheckbox.label = '根据标题自动生成'
      if (slugInput) {
        slugInput.label = '路径（Slug）'
        slugInput.validate = createSlugValidator(collectionSlug)
      }

      return options?.overrides ? options.overrides(field) : field
    },
  })
