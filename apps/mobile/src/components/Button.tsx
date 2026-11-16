import type { LucideIcon } from 'lucide-react-native'
import { ActivityIndicator, StyleSheet, type PressableProps, type ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { duration } from '@/theme/motion'
import { useTheme } from '@/theme/ThemeProvider'
import { fonts } from '@/theme/tokens'

import { PressScale } from './Motion'
import { Text } from './Text'

type Variant = 'primary' | 'tonal' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string
  variant?: Variant
  size?: Size
  icon?: LucideIcon
  loading?: boolean
  block?: boolean
  style?: ViewStyle
}

const SIZE: Record<Size, { height: number; pad: number; font: number; icon: number }> = {
  sm: { height: 36, pad: 14, font: 14, icon: 16 },
  md: { height: 46, pad: 18, font: 15, icon: 18 },
  lg: { height: 54, pad: 22, font: 16, icon: 19 },
}
export const BUTTON_RADIUS = 10

/**
 * Flat, solid buttons. Depth comes from motion, not gradients: a quick spring and a darkening
 * overlay on press.
 */
export function Button({ label, variant = 'primary', size = 'md', icon: Icon, loading, block, disabled, style, ...props }: ButtonProps) {
  const { colors, scheme } = useTheme()
  const s = SIZE[size]
  const inactive = Boolean(disabled || loading)

  const palette = {
    primary: { bg: colors.primary, fg: colors.onPrimary, border: 'transparent' },
    tonal: { bg: colors.primarySoft, fg: colors.primaryInk, border: 'transparent' },
    secondary: { bg: colors.surface, fg: colors.fg, border: colors.lineStrong },
    ghost: { bg: 'transparent', fg: colors.fg, border: 'transparent' },
    danger: { bg: colors.danger, fg: colors.onPrimary, border: 'transparent' },
  }[variant]
  // Disabled reads as "not yet available", not as a faded version of the real button.
  const look = disabled && !loading ? { bg: colors.surface2, fg: colors.muted, border: 'transparent' } : palette

  const pressed = useSharedValue(0)
  const overlay = useAnimatedStyle(() => ({ opacity: pressed.value }))
  const shade = variant === 'primary' || variant === 'danger' || scheme === 'dark' ? 'rgba(0,0,0,0.14)' : 'rgba(10,12,11,0.06)'

  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: Boolean(loading) }}
      disabled={inactive}
      haptic
      scaleTo={0.965}
      onPressIn={() => (pressed.value = withTiming(1, { duration: duration.fast }))}
      onPressOut={() => (pressed.value = withTiming(0, { duration: duration.base }))}
      style={[
        styles.base,
        { height: s.height, paddingHorizontal: s.pad, backgroundColor: look.bg, borderColor: look.border },
        block && styles.block,
        style,
      ]}
      {...props}
    >
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: shade }, overlay]} />
      {loading ? (
        <ActivityIndicator size="small" color={look.fg} />
      ) : (
        Icon && <Icon size={s.icon} color={look.fg} strokeWidth={2} />
      )}
      <Text style={{ color: look.fg, fontFamily: fonts.semibold, fontSize: s.font, letterSpacing: -0.15 }} numberOfLines={1}>
        {label}
      </Text>
    </PressScale>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: BUTTON_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  block: { alignSelf: 'stretch' },
})
