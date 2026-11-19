/** 两位序号，用于页码 / 张数显示 */
export const pad2 = (value: number) => String(value).padStart(2, '0')

/** 判断一条来源文本是否可以直接作为外链跳转 */
export const isHttpUrl = (value?: string | null) =>
  Boolean(value && /^https?:\/\//i.test(value.trim()))
