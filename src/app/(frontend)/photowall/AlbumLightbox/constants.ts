/** 3D 倾斜：角度上限（度）与弹簧参数（临界阻尼，回位不过冲） */
export const TILT_MAX_DEG = 4
export const TILT_SPRING = { stiffness: 240, damping: 24, mass: 0.6 }

/**
 * 透视值必须写进图片自身的 transform。
 * 父级 figure 带 FLIP 的 2D 变换，若透视只放在祖先层，
 * 3D 旋转会被压平成 2D 斜切，看起来像"歪掉"而不是"倾斜"。
 */
export const IMAGE_PERSPECTIVE = 1100

/** 图片在视口内的留白（px）：左右给箭头，上下给顶部胶囊与底部信息条 */
export const FRAME_PADDING = {
  desktop: { x: 168, top: 76, bottom: 104 },
  mobile: { x: 32, top: 84, bottom: 96 },
} as const

/** 断点：与 Tailwind 的 sm 保持一致 */
export const SMALL_VIEWPORT = 640

/** 灯箱过渡时长（秒），respects prefers-reduced-motion */
export const DURATION = {
  scrim: 0.3,
  close: 0.24,
  enterDesktop: 0.42,
  enterReduced: 0.12,
  swap: 0.3,
} as const

/** 图片宽高比，异常数据回退 16:9 */
export const ratioOf = (photo: { height: number; width: number }) =>
  photo.width > 0 && photo.height > 0 ? photo.width / photo.height : 16 / 9
