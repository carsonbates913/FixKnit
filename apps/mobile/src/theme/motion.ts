import { Easing, ReduceMotion } from 'react-native-reanimated'

/** Motion tokens. Quick and soft: nothing bounces more than it needs to. */
export const duration = { fast: 140, base: 220, slow: 360, page: 280 } as const

export const easeOut = Easing.bezier(0.2, 0.8, 0.2, 1)

/** Press feedback: snappy in, gentle out. */
export const pressSpring = { damping: 18, stiffness: 420, mass: 0.6, reduceMotion: ReduceMotion.System } as const

/** Playful pop for likes, checks and selected tabs. */
export const popSpring = { damping: 9, stiffness: 320, mass: 0.6, reduceMotion: ReduceMotion.System } as const

/** Delay for the nth item in a staggered list, capped so long lists don't drag. */
export function stagger(index: number, step = 45, max = 6): number {
  return Math.min(index, max) * step
}
