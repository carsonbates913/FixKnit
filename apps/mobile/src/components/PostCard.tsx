import { Image } from 'expo-image'
import { Link, router } from 'expo-router'
import { Heart } from 'lucide-react-native'
import { useState } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated'
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native'

import { useToggleLike } from '@/api/hooks'
import type { PostOut } from '@/api/schema'
import { mediaUrl } from '@/lib/env'
import { techniqueIcon } from '@/lib/icons'
import { popSpring } from '@/theme/motion'
import { timeAgo, titleCase } from '@/lib/format'
import { useTheme } from '@/theme/ThemeProvider'
import { radius } from '@/theme/tokens'

import { Avatar } from './Avatar'
import { BeforeAfter } from './BeforeAfter'
import { Text } from './Text'

export function PostCard({ post, linkToDetail = true }: { post: PostOut; linkToDetail?: boolean }) {
  const { colors } = useTheme()
  const like = useToggleLike()
  const before = post.media.find((m) => m.role === 'before')
  const after = post.media.find((m) => m.role === 'after')
  const first = post.media[0]
  const ratio = first ? Math.min(Math.max(first.width / first.height, 0.8), 1.6) : 1

  return (
    <View style={[styles.card, { borderColor: colors.line, backgroundColor: colors.surface }]}>
      <Link href={`/u/${post.author.handle}`} asChild>
        <Pressable style={styles.header} accessibilityRole="link">
          <Avatar name={post.author.display_name} handle={post.author.handle} size={34} />
          <View style={{ flex: 1 }}>
            <Text variant="smallMedium">{post.author.display_name}</Text>
            <Text variant="data" tone="muted" style={{ fontSize: 12 }}>@{post.author.handle} · {timeAgo(post.created_at)}</Text>
          </View>
          {post.technique && (
            <View style={styles.technique} accessibilityLabel={titleCase(post.technique)}>
              <Image source={techniqueIcon[post.technique]} style={{ width: 26, height: 26 }} contentFit="contain" />
              <Text variant="label">{post.technique}</Text>
            </View>
          )}
        </Pressable>
      </Link>

      {before && after ? (
        <BeforeAfter before={before.url} after={after.url} aspectRatio={ratio} />
      ) : (
        <Gallery media={post.media} ratio={ratio} onPress={linkToDetail ? () => router.push(`/post/${post.id}`) : undefined} />
      )}

      <View style={styles.body}>
        <LikeButton liked={post.liked_by_me} count={post.like_count} onToggle={() => like.mutate({ id: post.id, liked: !post.liked_by_me })} />
        {post.caption ? <Text variant="body">{post.caption}</Text> : null}
        {post.tags.length > 0 && (
          <Text variant="small" tone="primaryInk">{post.tags.map((t) => `#${t}`).join('  ')}</Text>
        )}
      </View>
    </View>
  )
}

function LikeButton({ liked, count, onToggle }: { liked: boolean; count: number; onToggle: () => void }) {
  const { colors } = useTheme()
  const scale = useSharedValue(1)
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={liked ? 'Unlike' : 'Like'}
      accessibilityState={{ selected: liked }}
      onPress={() => {
        if (!liked) scale.value = withSequence(withSpring(1.35, popSpring), withSpring(1, popSpring))
        onToggle()
      }}
      style={styles.like}
      hitSlop={8}
    >
      <Animated.View style={animated}>
        <Heart size={22} strokeWidth={1.8} color={liked ? colors.danger : colors.fg} fill={liked ? colors.danger : 'transparent'} />
      </Animated.View>
      <Text variant="data">{count}</Text>
    </Pressable>
  )
}

function Gallery({ media, ratio, onPress }: { media: PostOut['media']; ratio: number; onPress?: () => void }) {
  const { width: screen } = useWindowDimensions()
  const [index, setIndex] = useState(0)
  const width = Math.min(screen, 560) - 36
  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={{ borderRadius: radius.lg }}
      >
        {media.map((m) => (
          <Pressable key={m.id} onPress={onPress} disabled={!onPress}>
            <Image source={{ uri: mediaUrl(m.url) }} style={{ width, aspectRatio: ratio, borderRadius: radius.lg }} contentFit="cover" transition={200} />
          </Pressable>
        ))}
      </ScrollView>
      {media.length > 1 && (
        <View style={styles.dots}>
          {media.map((m, i) => (
            <View key={m.id} style={[styles.dot, { opacity: i === index ? 1 : 0.3 }]} />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius.lg, padding: 12, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  body: { gap: 6 },
  technique: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  like: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 2 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#5A615D' },
})
