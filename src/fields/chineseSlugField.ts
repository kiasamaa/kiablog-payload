import { slugField } from 'payload'

type SlugFieldOptions = Parameters<typeof slugField>[0]

/**
 * 中文版 slugField。
 * Payload 内置的 slug 字段会把标签写成英文的 Generate Slug / Slug，
 * 这里统一替换为中文，其余行为与官方实现保持一致。
 */
export const chineseSlugField = (options: SlugFieldOptions = {}) =>
  slugField({
    ...options,
    overrides: (field) => {
      const controls = field.fields as unknown as { label?: string }[]
      const [generateCheckbox, slugInput] = controls

      if (generateCheckbox) generateCheckbox.label = '根据标题自动生成'
      if (slugInput) slugInput.label = '路径（Slug）'

      return options?.overrides ? options.overrides(field) : field
    },
  })
