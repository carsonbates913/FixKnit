import { Image } from 'expo-image'
import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { duration } from '@/theme/motion'
import { useTheme } from '@/theme/ThemeProvider'
import { fonts } from '@/theme/tokens'

import { PressScale } from './Motion'

interface ChipProps {
  label: string
  selected: boolean
  onPress: () => void
  /** Optional 3D craft icon (see lib/icons). */
  icon?: number
}

/** A selectable chip. Selection animates to a soft green fill with a crisp green edge. */
export function Chip({ label, selected, onPress, icon }: ChipProps) {
  const { colors } = useTheme()
  const on = useSharedValue(selected ? 1 : 0)
  useEffect(() => {
    on.value = withTiming(selected ? 1 : 0, { duration: duration.base })
  }, [selected, on])

  const animated = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(on.value, [0, 1], [colors.surface, colors.primarySoft]),
    borderColor: interpolateColor(on.value, [0, 1], [colors.lineStrong, colors.primary]),
  }))
  const text = useAnimatedStyle(() => ({ color: interpolateColor(on.value, [0, 1], [colors.fg, colors.primaryInk]) }))

  return (
    <PressScale
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      haptic
      scaleTo={0.94}
      style={[styles.chip, icon ? styles.withIcon : null, animated]}
    >
      {icon && <Image source={icon} style={styles.icon} contentFit="contain" />}
      <Animated.Text style={[styles.label, text]}>{label}</Animated.Text>
    </PressScale>
  )
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5 },
  withIcon: { paddingLeft: 8 },
  icon: { width: 24, height: 24 },
  label: { fontFamily: fonts.medium, fontSize: 14.5 },
})
