import * as Haptics from 'expo-haptics'
import { useEffect, type ReactNode } from 'react'
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming, type AnimatedStyle } from 'react-native-reanimated'

import { duration, easeOut, pressSpring, stagger } from '@/theme/motion'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

interface PressScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<AnimatedStyle<ViewStyle>>
  /** How far to shrink while pressed. */
  scaleTo?: number
  haptic?: boolean
  children?: ReactNode
}

/** A Pressable that springs down slightly when pressed (and taps the haptic engine on phones). */
export function PressScale({ style, scaleTo = 0.97, haptic = false, onPressIn, onPressOut, onPress, disabled, children, ...props }: PressScaleProps) {
  const scale = useSharedValue(1)
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, pressSpring)
        onPressIn?.(e)
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, pressSpring)
        onPressOut?.(e)
      }}
      onPress={(e) => {
        if (haptic && Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {})
        onPress?.(e)
      }}
      style={[style, animated]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  )
}

/**
 * Fades content up into place when it first mounts. Pass `index` to stagger siblings.
 * Driven by plain animated opacity/transform (not layout animations), so it never affects layout.
 */
export function Appear({ children, index = 0, style }: { children: ReactNode; index?: number; style?: StyleProp<ViewStyle> }) {
  const progress = useSharedValue(0)
  useEffect(() => {
    progress.value = withDelay(stagger(index), withTiming(1, { duration: duration.slow, easing: easeOut, reduceMotion: ReduceMotion.System }))
  }, [index, progress])
  const animated = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 10 }],
  }))
  return <Animated.View style={[style, animated]}>{children}</Animated.View>
}

/** Plain opacity fade-in, for swapping a skeleton for real content. */
export function FadeInView({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const progress = useSharedValue(0)
  useEffect(() => {
    progress.value = withTiming(1, { duration: duration.base, reduceMotion: ReduceMotion.System })
  }, [progress])
  const animated = useAnimatedStyle(() => ({ opacity: progress.value }))
  return <Animated.View style={[style, animated]}>{children}</Animated.View>
}
