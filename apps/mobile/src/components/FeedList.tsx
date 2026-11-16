import type { ReactElement } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native'

import { useFeed } from '@/api/hooks'
import { useTheme } from '@/theme/ThemeProvider'

import { Notice } from './Notice'
import { PostCard } from './PostCard'
import { YarnLoader } from './YarnLoader'

interface FeedListProps {
  author?: string
  header?: ReactElement
  empty?: ReactElement
}

/** Infinite, pull-to-refresh list of posts; the whole community or one maker's. */
export function FeedList({ author, header, empty }: FeedListProps) {
  const { colors } = useTheme()
  const feed = useFeed(author)
  const posts = feed.data?.pages.flatMap((p) => p.items) ?? []

  return (
    <FlatList
      data={posts}
      keyExtractor={(p) => p.id}
      renderItem={({ item }) => <PostCard post={item} />}
      ListHeaderComponent={header}
      ListEmptyComponent={
        feed.isPending ? (
          <YarnLoader label="Loading posts…" />
        ) : feed.isError ? (
          <Notice title="Couldn’t load posts">{feed.error.message}</Notice>
        ) : (
          empty
        )
      }
      ListFooterComponent={feed.isFetchingNextPage ? <ActivityIndicator color={colors.primary} style={{ margin: 16 }} /> : undefined}
      onEndReached={() => feed.hasNextPage && !feed.isFetchingNextPage && feed.fetchNextPage()}
      onEndReachedThreshold={0.6}
      refreshControl={
        <RefreshControl refreshing={feed.isRefetching && !feed.isFetchingNextPage} onRefresh={() => void feed.refetch()} tintColor={colors.primary} />
      }
      contentContainerStyle={styles.content}
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
    />
  )
}

const styles = StyleSheet.create({
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 18, paddingVertical: 16, flexGrow: 1 },
})
