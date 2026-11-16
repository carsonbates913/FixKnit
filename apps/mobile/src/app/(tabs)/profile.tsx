import { router } from 'expo-router'
import { Settings } from 'lucide-react-native'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '@/components/Button'
import { FeedList } from '@/components/FeedList'
import { ProfileHeader } from '@/components/ProfileHeader'
import { Text } from '@/components/Text'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/theme/ThemeProvider'

export default function MyProfile() {
  const { colors } = useTheme()
  const { me } = useAuth()
  const profile = me?.profile
  if (!profile) return null

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <FeedList
        author={profile.handle}
        header={
          <ProfileHeader
            profile={profile}
            action={<Button label="Settings" icon={Settings} variant="secondary" size="sm" onPress={() => router.push('/settings')} />}
          />
        }
        empty={
          <View style={{ gap: 12, paddingVertical: 24, alignItems: 'center' }}>
            <Text variant="body" tone="muted" center>You haven’t posted yet.</Text>
            <Button label="Post a creation" onPress={() => router.push('/post/new')} />
          </View>
        }
      />
    </SafeAreaView>
  )
}
