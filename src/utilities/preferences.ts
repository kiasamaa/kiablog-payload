const ASIDE_KEY = 'nb-aside-hidden'
const HOTKEY_KEY = 'nb-hotkeys-enabled'
const POST_LAYOUT_KEY = 'nb-post-compact'

const canUseStorage = () => typeof window !== 'undefined' && 'localStorage' in window

export const getAsideHidden = (): boolean => {
  if (!canUseStorage()) return false

  return window.localStorage.getItem(ASIDE_KEY) === '1'
}

export const setAsideHidden = (hidden: boolean) => {
  if (!canUseStorage()) return

  window.localStorage.setItem(ASIDE_KEY, hidden ? '1' : '0')
  document.documentElement.classList.toggle('hide-aside', hidden)
  window.dispatchEvent(new CustomEvent('aside-toggle', { detail: { hidden } }))
}

export const getHotkeysEnabled = (): boolean => {
  if (!canUseStorage()) return true

  return window.localStorage.getItem(HOTKEY_KEY) !== '0'
}

export const setHotkeysEnabled = (enabled: boolean) => {
  if (!canUseStorage()) return

  window.localStorage.setItem(HOTKEY_KEY, enabled ? '1' : '0')
  window.dispatchEvent(new CustomEvent('hotkey-toggle', { detail: { enabled } }))
}

/** 文章列表：默认舒展（2 列），可切到紧凑（3 列） */
export const getCompactLayout = (): boolean => {
  if (!canUseStorage()) return false

  return window.localStorage.getItem(POST_LAYOUT_KEY) === '1'
}

/**
 * 切换后直接写在 <html> 上，列表样式由 CSS 属性选择器接管，
 * 不需要组件重渲染，刷新时也由 layout 里的首屏脚本提前恢复。
 */
export const setCompactLayout = (compact: boolean) => {
  if (!canUseStorage()) return

  window.localStorage.setItem(POST_LAYOUT_KEY, compact ? '1' : '0')
  document.documentElement.dataset.postLayout = compact ? 'compact' : 'comfortable'
  window.dispatchEvent(new CustomEvent('post-layout-toggle', { detail: { compact } }))
}
