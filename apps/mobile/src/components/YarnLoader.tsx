import { Image } from 'expo-image'
import { useEffect, useRef } from 'react'
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native'

import { Text } from './Text'

const yarn = require('../../assets/green-yarn.webp')

export function YarnLoader({ label = 'Loading…', size = 64 }: { label?: string; size?: number }) {
  const spin = useRef(new Animated.Value(0)).current

  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce) return
      loop = Animated.loop(
        Animated.timing(spin, { toValue: 1, duration: 2800, easing: Easing.bezier(0.2, 0.7, 0.2, 1), useNativeDriver: true }),
      )
      loop.start()
    })
    return () => loop?.stop()
  }, [spin])

  const rotate = spin.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '180deg', '0deg'] })
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={label} style={styles.wrap}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Image source={yarn} style={{ width: size, height: size }} contentFit="contain" />
      </Animated.View>
      <Text variant="label">{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({ wrap: { alignItems: 'center', gap: 14, paddingVertical: 32 } })
