const pad = (value: number) => String(value).padStart(2, '0')

/**
 * 固定输出 `YYYY-MM-DD` 或 `YYYY-MM-DD HH:mm`，
 * 避免服务端与客户端因时区差异导致 hydration 不一致。
 */
export const formatDate = (value?: string | null, withTime = false): string => {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

  return withTime ? `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}` : day
}
