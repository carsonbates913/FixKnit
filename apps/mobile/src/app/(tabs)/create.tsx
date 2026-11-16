import { Image } from 'expo-image'
import { router } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { StyleSheet, View } from 'react-native'

import { Appear, PressScale } from '@/components/Motion'
import { Screen } from '@/components/Screen'
import { Eyebrow, Text } from '@/components/Text'
import { craftIcons } from '@/lib/icons'
import { useTheme } from '@/theme/ThemeProvider'
import { radius } from '@/theme/tokens'

export default function Create() {
  return (
    <Screen>
      <Appear style={{ gap: 6 }}>
        <Eyebrow>Create</Eyebrow>
        <Text variant="h1">What are you working on?</Text>
      </Appear>
      <Appear index={1}>
        <Option
          icon={craftIcons.sewing}
          title="Fix something"
          body="Photograph a hole, tear or worn patch. Get a diagnosis and step-by-step repair options."
          tag="Repair assistant"
          onPress={() => router.push('/fix')}
        />
      </Appear>
      <Appear index={2}>
        <Option
          icon={craftIcons.crochet}
          title="Post a creation"
          body="Share something you’ve crocheted, knitted, embroidered or mended with everyone."
          tag="Community"
          onPress={() => router.push('/post/new')}
        />
      </Appear>
    </Screen>
  )
}

function Option({ icon, title, body, tag, onPress }: { icon: number; title: string; body: string; tag: string; onPress: () => void }) {
  const { colors } = useTheme()
  return (
    <PressScale accessibilityRole="button" haptic scaleTo={0.98} onPress={onPress} style={[styles.card, { borderColor: colors.line, backgroundColor: colors.surface }]}>
      <View style={[styles.art, { backgroundColor: colors.bg2 }]}>
        <Image source={icon} style={styles.icon} contentFit="contain" />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="label">{tag}</Text>
        <Text variant="h2">{title}</Text>
        <Text variant="small" tone="muted">{body}</Text>
      </View>
      <ChevronRight size={20} color={colors.muted} />
    </PressScale>
  )
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderWidth: 1, borderRadius: radius.xl },
  art: { width: 76, height: 76, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 62, height: 62 },
})
