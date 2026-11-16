import { Image } from 'expo-image'
import { useRef, useState } from 'react'
import { PanResponder, StyleSheet, View, type LayoutChangeEvent } from 'react-native'

import { mediaUrl } from '@/lib/env'
import { radius } from '@/theme/tokens'

import { Text } from './Text'

/** Drag the handle to compare the damaged garment with the finished repair. */
export function BeforeAfter({ before, after, aspectRatio = 1 }: { before: string; after: string; aspectRatio?: number }) {
  const [width, setWidth] = useState(0)
  const [split, setSplit] = useState(0.5)
  const widthRef = useRef(0)

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => update(e.nativeEvent.locationX),
      onPanResponderMove: (e) => update(e.nativeEvent.locationX),
    }),
  ).current

  function update(x: number) {
    if (widthRef.current) setSplit(Math.min(0.98, Math.max(0.02, x / widthRef.current)))
  }

  function onLayout(e: LayoutChangeEvent) {
    widthRef.current = e.nativeEvent.layout.width
    setWidth(e.nativeEvent.layout.width)
  }

  return (
    <View
      onLayout={onLayout}
      style={[styles.frame, { aspectRatio }]}
      accessible
      accessibilityLabel="Before and after photos. Drag to compare."
      {...responder.panHandlers}
    >
      <Image source={{ uri: mediaUrl(after) }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View pointerEvents="none" style={[styles.clip, { width: width * split }]}>
        <Image source={{ uri: mediaUrl(before) }} style={{ width, height: '100%' }} contentFit="cover" />
      </View>
      <View pointerEvents="none" style={[styles.handle, { left: width * split - 1 }]}>
        <View style={styles.knob}>
          <Text variant="label" style={{ color: '#0A0C0B', letterSpacing: 0 }}>{'‹ ›'}</Text>
        </View>
      </View>
      <View pointerEvents="none" style={[styles.tag, { left: 10 }]}><Text variant="label" style={styles.tagText}>Before</Text></View>
      <View pointerEvents="none" style={[styles.tag, { right: 10 }]}><Text variant="label" style={styles.tagText}>After</Text></View>
    </View>
  )
}

const styles = StyleSheet.create({
  frame: { width: '100%', borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#171A19', cursor: 'ew-resize' } as never,
  clip: { position: 'absolute', top: 0, bottom: 0, left: 0, overflow: 'hidden' },
  handle: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  knob: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  tag: { position: 'absolute', top: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: 'rgba(10,12,11,0.7)' },
  tagText: { color: '#FFFFFF' },
})
