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

/** 把建站日期换算成运行天数 */
export const getRunningDays = (since?: string | null): number => {
  if (!since) return 0

  const start = new Date(since).getTime()

  if (Number.isNaN(start)) return 0

  return Math.max(0, Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24)))
}
