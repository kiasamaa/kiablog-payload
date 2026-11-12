const ASIDE_KEY = 'nb-aside-hidden'
const HOTKEY_KEY = 'nb-hotkeys-enabled'

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
