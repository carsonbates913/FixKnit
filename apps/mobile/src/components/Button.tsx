import type { LucideIcon } from 'lucide-react-native'
import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps, type ViewStyle } from 'react-native'

import { useTheme } from '@/theme/ThemeProvider'
import { radius } from '@/theme/tokens'

import { Text } from './Text'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
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

const HEIGHT: Record<Size, number> = { sm: 34, md: 42, lg: 50 }

export function Button({ label, variant = 'primary', size = 'md', icon: Icon, loading, block, disabled, style, ...props }: ButtonProps) {
  const { colors } = useTheme()
  const filled = variant === 'primary' || variant === 'danger'
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : variant === 'secondary' ? colors.surface : 'transparent'
  const fg = filled ? colors.onPrimary : colors.fg
  const inactive = disabled || loading

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(inactive), busy: Boolean(loading) }}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        {
          height: HEIGHT[size],
          paddingHorizontal: size === 'sm' ? 12 : size === 'md' ? 16 : 20,
          backgroundColor: bg,
          borderColor: variant === 'secondary' ? colors.lineStrong : 'transparent',
          opacity: inactive ? 0.5 : 1,
          transform: [{ translateY: pressed ? 1 : 0 }],
        },
        filled && styles.filledShadow,
        variant === 'ghost' && pressed && { backgroundColor: colors.surface2 },
        block && { alignSelf: 'stretch' },
        style,
      ]}
      {...props}
    >
      {/* Restrained gloss: a white sheen over the top half of filled buttons. */}
      {filled && <View pointerEvents="none" style={styles.sheen} />}
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 15 : 17} color={fg} strokeWidth={1.8} />}
          <Text variant="smallMedium" style={{ color: fg, fontSize: size === 'lg' ? 16 : size === 'sm' ? 13.5 : 15 }}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  filledShadow: {
    shadowColor: '#0A8046',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '52%',
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
})
