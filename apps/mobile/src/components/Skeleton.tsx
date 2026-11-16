import { useEffect } from 'react'
import { StyleSheet, View, type DimensionValue, type ViewStyle } from 'react-native'
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'

import { useTheme } from '@/theme/ThemeProvider'
import { radius } from '@/theme/tokens'

/** A placeholder block that gently breathes while content loads. */
export function Skeleton({ width = '100%', height = 14, round = radius.sm, style }: { width?: DimensionValue; height?: DimensionValue; round?: number; style?: ViewStyle }) {
  const { colors } = useTheme()
  const pulse = useSharedValue(0)
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad), reduceMotion: ReduceMotion.System }), -1, true)
  }, [pulse])
  const animated = useAnimatedStyle(() => ({ opacity: 0.55 + pulse.value * 0.45 }))
  return <Animated.View accessibilityElementsHidden style={[{ width, height, borderRadius: round, backgroundColor: colors.surface2 }, animated, style]} />
}

export function PostCardSkeleton() {
  const { colors } = useTheme()
  return (
    <View style={[styles.card, { borderColor: colors.line, backgroundColor: colors.surface }]}>
      <View style={styles.row}>
        <Skeleton width={34} height={34} round={17} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton width="45%" height={12} />
          <Skeleton width="30%" height={10} />
        </View>
      </View>
      <Skeleton height={undefined} round={radius.lg} style={{ aspectRatio: 1 }} />
      <Skeleton width="20%" height={14} />
      <Skeleton width="85%" height={12} />
    </View>
  )
}

export function FeedSkeleton({ count = 2 }: { count?: number }) {
  return (
    <View style={{ gap: 14 }} accessibilityLabel="Loading posts" accessibilityRole="progressbar">
      {Array.from({ length: count }, (_, i) => <PostCardSkeleton key={i} />)}
    </View>
  )
}

export function ProjectRowSkeleton() {
  const { colors } = useTheme()
  return (
    <View style={[styles.card, styles.row, { borderColor: colors.line, backgroundColor: colors.surface }]}>
      <Skeleton width={64} height={64} round={radius.md} />
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton width="70%" height={14} />
        <Skeleton width="40%" height={20} />
      </View>
    </View>
  )
}

export function ProfileHeaderSkeleton() {
  return (
    <View style={{ gap: 14, marginBottom: 18 }}>
      <View style={styles.row}>
        <Skeleton width={64} height={64} round={32} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="50%" height={18} />
          <Skeleton width="30%" height={12} />
        </View>
      </View>
      <Skeleton width="80%" height={12} />
    </View>
  )
}

/** Mirrors the project screen: title, photo, checklist. */
export function ProjectSkeleton() {
  const { colors } = useTheme()
  return (
    <View style={{ gap: 20 }} accessibilityLabel="Loading project" accessibilityRole="progressbar">
      <View style={{ gap: 10 }}>
        <Skeleton width="30%" height={10} />
        <Skeleton width="80%" height={28} />
        <Skeleton width="50%" height={24} />
      </View>
      <Skeleton height={undefined} round={radius.lg} style={{ aspectRatio: 4 / 3 }} />
      <View style={[styles.card, { borderColor: colors.line, gap: 14 }]}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.row}>
            <Skeleton width={22} height={22} round={radius.sm} />
            <Skeleton width={`${85 - i * 10}%`} height={14} />
          </View>
        ))}
      </View>
    </View>
  )
}

/** Mirrors the diagnosis report while the photo is analysed. */
export function DiagnosisSkeleton() {
  const { colors } = useTheme()
  return (
    <View style={{ gap: 14 }}>
      <View style={[styles.card, { borderColor: colors.line, gap: 14 }]}>
        <Skeleton width="25%" height={10} />
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.row}>
            <Skeleton width={64} height={10} />
            <Skeleton width={i === 2 ? 150 : 100} height={24} />
          </View>
        ))}
      </View>
      {[0, 1].map((i) => (
        <View key={i} style={[styles.card, { borderColor: colors.line, gap: 10 }]}>
          <Skeleton width="20%" height={10} />
          <Skeleton width="55%" height={20} />
          <Skeleton width="90%" height={12} />
          <View style={styles.row}>
            <Skeleton width={90} height={24} />
            <Skeleton width={70} height={24} />
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius.lg, padding: 12, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
})
