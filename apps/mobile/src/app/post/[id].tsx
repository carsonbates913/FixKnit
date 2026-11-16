import { router, useLocalSearchParams } from 'expo-router'
import { Trash2 } from 'lucide-react-native'
import { useState } from 'react'
import { View } from 'react-native'

import { api, unwrap } from '@/api/client'
import { usePost } from '@/api/hooks'
import { Button } from '@/components/Button'
import { Notice } from '@/components/Notice'
import { PostCard } from '@/components/PostCard'
import { Screen } from '@/components/Screen'
import { Text } from '@/components/Text'
import { YarnLoader } from '@/components/YarnLoader'
import { useAuth } from '@/lib/auth'
import { useQueryClient } from '@tanstack/react-query'

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const post = usePost(id)
  const { me } = useAuth()
  const qc = useQueryClient()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function remove() {
    setDeleting(true)
    await unwrap(api.DELETE('/api/posts/{post_id}', { params: { path: { post_id: id } } }))
    await qc.invalidateQueries({ queryKey: ['posts'] })
    await qc.invalidateQueries({ queryKey: ['me'] })
    router.back()
  }

  return (
    <Screen edges={['bottom']}>
      {post.isPending && <YarnLoader label="Loading post…" />}
      {post.isError && <Notice title="Couldn’t load this post">{post.error.message}</Notice>}
      {post.data && (
        <>
          <PostCard post={post.data} linkToDetail={false} />
          {post.data.author.handle === me?.profile?.handle &&
            (confirming ? (
              <View style={{ gap: 10 }}>
                <Text variant="body">Delete this post? This can’t be undone.</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Button label="Delete post" variant="danger" loading={deleting} onPress={remove} />
                  <Button label="Keep it" variant="ghost" onPress={() => setConfirming(false)} />
                </View>
              </View>
            ) : (
              <Button label="Delete post" icon={Trash2} variant="ghost" onPress={() => setConfirming(true)} />
            ))}
        </>
      )}
    </Screen>
  )
}
