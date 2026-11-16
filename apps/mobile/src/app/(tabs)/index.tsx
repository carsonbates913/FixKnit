import { router } from 'expo-router'
import { Plus } from 'lucide-react-native'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button } from '@/components/Button'
import { FeedList } from '@/components/FeedList'
import { Appear } from '@/components/Motion'
import { Logo } from '@/components/Logo'
import { Eyebrow, Text } from '@/components/Text'
import { useTheme } from '@/theme/ThemeProvider'

export default function Home() {
  const { colors } = useTheme()
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <FeedList
        header={
          <Appear style={{ gap: 18, marginBottom: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Logo />
              <Button label="Post" icon={Plus} size="sm" onPress={() => router.push('/post/new')} />
            </View>
            <View style={{ gap: 6 }}>
              <Eyebrow>Community</Eyebrow>
              <Text variant="h1">What people are making</Text>
            </View>
          </Appear>
        }
        empty={
          <View style={{ gap: 12, paddingVertical: 32, alignItems: 'center' }}>
            <Text variant="title" center>Nothing here yet</Text>
            <Text variant="body" tone="muted" center>Share a crochet piece, a mend or a work in progress to start the feed.</Text>
            <Button label="Post your first creation" onPress={() => router.push('/post/new')} />
          </View>
        }
      />
    </SafeAreaView>
  )
}
