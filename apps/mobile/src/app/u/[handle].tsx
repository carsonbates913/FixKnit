import { Stack, useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'

import { useProfile } from '@/api/hooks'
import { FeedList } from '@/components/FeedList'
import { Notice } from '@/components/Notice'
import { ProfileHeader } from '@/components/ProfileHeader'
import { Text } from '@/components/Text'
import { Appear } from '@/components/Motion'
import { FeedSkeleton, ProfileHeaderSkeleton } from '@/components/Skeleton'
import { useTheme } from '@/theme/ThemeProvider'

export default function MakerProfile() {
  const { handle } = useLocalSearchParams<{ handle: string }>()
  const { colors } = useTheme()
  const profile = useProfile(handle)

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ title: `@${handle}` }} />
      {profile.isPending ? (
        <View style={{ padding: 18, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
          <ProfileHeaderSkeleton />
          <FeedSkeleton count={1} />
        </View>
      ) : profile.isError ? (
        <View style={{ padding: 18 }}><Notice title="Couldn’t load this profile">{profile.error.message}</Notice></View>
      ) : (
        <FeedList
          author={handle}
          header={
            <Appear>
              <ProfileHeader profile={profile.data} />
            </Appear>
          }
          empty={<Text variant="body" tone="muted" center>No posts yet.</Text>}
        />
      )}
    </View>
  )
}
