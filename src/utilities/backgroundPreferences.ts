const BG_BLUR_KEY = 'nb-bg-blur'
const BG_OPACITY_KEY = 'nb-bg-opacity'
const BG_GLOW_KEY = 'nb-bg-glow'
const BG_VISIBLE_KEY = 'nb-bg-visible'
const BG_INDEX_KEY = 'nb-bg-index'

export type BackgroundSettings = {
  /** 当前背景图索引（背景图有多张时） */
  index: number
  /** 模糊半径，px */
  blur: number
  /** 背景图不透明度，0–100 */
  opacity: number
  /** 是否显示三团光斑 */
  glow: boolean
  /** 是否显示背景图（关闭后只保留雾蓝渐变） */
  visible: boolean
}

export const DEFAULT_BACKGROUND_SETTINGS: BackgroundSettings = {
  index: 0,
  blur: 20,
  opacity: 65,
  glow: true,
  visible: true,
}

const canUseStorage = () => typeof window !== 'undefined' && 'localStorage' in window

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))

export const getBackgroundSettings = (): BackgroundSettings => {
  if (!canUseStorage()) return DEFAULT_BACKGROUND_SETTINGS

  const blur = Number(window.localStorage.getItem(BG_BLUR_KEY) ?? DEFAULT_BACKGROUND_SETTINGS.blur)
  const opacity = Number(
    window.localStorage.getItem(BG_OPACITY_KEY) ?? DEFAULT_BACKGROUND_SETTINGS.opacity,
  )
  const index = Number(
    window.localStorage.getItem(BG_INDEX_KEY) ?? DEFAULT_BACKGROUND_SETTINGS.index,
  )

  return {
    blur: clamp(blur, 0, 40),
    glow: window.localStorage.getItem(BG_GLOW_KEY) !== '0',
    index: Math.max(0, Math.floor(Number.isFinite(index) ? index : 0)),
    opacity: clamp(opacity, 0, 100),
    visible: window.localStorage.getItem(BG_VISIBLE_KEY) !== '0',
  }
}

/** 把偏好写到 <html>：CSS 变量负责模糊/透明，dataset 负责开关 */
export const applyBackgroundSettings = (settings: BackgroundSettings) => {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  root.style.setProperty('--site-bg-blur', `${settings.blur}px`)
  root.style.setProperty('--site-bg-opacity', `${settings.opacity / 100}`)
  root.dataset.bgGlow = settings.glow ? '1' : '0'
  root.dataset.bgVisible = settings.visible ? '1' : '0'
}

export const saveBackgroundSettings = (settings: BackgroundSettings) => {
  if (!canUseStorage()) return

  window.localStorage.setItem(BG_BLUR_KEY, String(settings.blur))
  window.localStorage.setItem(BG_OPACITY_KEY, String(settings.opacity))
  window.localStorage.setItem(BG_GLOW_KEY, settings.glow ? '1' : '0')
  window.localStorage.setItem(BG_VISIBLE_KEY, settings.visible ? '1' : '0')
  window.localStorage.setItem(BG_INDEX_KEY, String(settings.index))

  applyBackgroundSettings(settings)
  window.dispatchEvent(new CustomEvent('background-settings', { detail: settings }))
}

export const getBackgroundImageUrls = (
  images:
    | null
    | undefined
    | {
        image:
          | number
          | {
              url?: null | string
              sizes?: null | Record<string, { url?: null | string } | undefined>
            }
      }[],
): string[] =>
  (images ?? [])
    .map((item) => {
      const image = item.image
      if (!image || typeof image === 'number') return null
      return image.sizes?.xlarge?.url || image.sizes?.large?.url || image.url || null
    })
    .filter((url): url is string => Boolean(url))
