/**
 * 侧边栏变体 → 卡片清单。
 * 以后要在新页面显示侧边栏，加一个变体 + 在 Aside 里补对应分支即可。
 */
export type AsideVariant = 'posts-list' | 'post-detail'

export type AsideCardKind = 'site' | 'tags' | 'stats' | 'toc' | 'series' | 'recent'

export const ASIDE_CARDS: Record<AsideVariant, AsideCardKind[]> = {
  'posts-list': ['site', 'tags', 'stats'],
  'post-detail': ['site', 'toc', 'series', 'recent'],
}
