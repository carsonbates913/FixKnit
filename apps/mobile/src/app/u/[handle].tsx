import { Stack, useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'

import { useProfile } from '@/api/hooks'
import { FeedList } from '@/components/FeedList'
import { Notice } from '@/components/Notice'
import { ProfileHeader } from '@/components/ProfileHeader'
import { Text } from '@/components/Text'
import { YarnLoader } from '@/components/YarnLoader'
import { useTheme } from '@/theme/ThemeProvider'

export default function MakerProfile() {
  const { handle } = useLocalSearchParams<{ handle: string }>()
  const { colors } = useTheme()
  const profile = useProfile(handle)

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Stack.Screen options={{ title: `@${handle}` }} />
      {profile.isPending ? (
        <YarnLoader label="Loading profile…" />
      ) : profile.isError ? (
        <View style={{ padding: 18 }}><Notice title="Couldn’t load this profile">{profile.error.message}</Notice></View>
      ) : (
        <FeedList
          author={handle}
          header={<ProfileHeader profile={profile.data} />}
          empty={<Text variant="body" tone="muted" center>No posts yet.</Text>}
        />
      )}
    </View>
  )
}
