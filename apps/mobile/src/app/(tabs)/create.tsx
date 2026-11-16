import { router } from 'expo-router'
import { ChevronRight, ImagePlus, ScanSearch, type LucideIcon } from 'lucide-react-native'
import { Pressable, StyleSheet, View } from 'react-native'

import { Screen } from '@/components/Screen'
import { Eyebrow, Text } from '@/components/Text'
import { useTheme } from '@/theme/ThemeProvider'
import { radius } from '@/theme/tokens'

export default function Create() {
  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <Eyebrow>Create</Eyebrow>
        <Text variant="h1">What are you working on?</Text>
      </View>
      <Option
        icon={ScanSearch}
        title="Fix something"
        body="Photograph a hole, tear or worn patch. Get a diagnosis and step-by-step repair options."
        tag="Repair assistant"
        onPress={() => router.push('/fix')}
      />
      <Option
        icon={ImagePlus}
        title="Post a creation"
        body="Share something you’ve crocheted, knitted, embroidered or mended with everyone."
        tag="Community"
        onPress={() => router.push('/post/new')}
      />
    </Screen>
  )
}

function Option({ icon: Icon, title, body, tag, onPress }: { icon: LucideIcon; title: string; body: string; tag: string; onPress: () => void }) {
  const { colors } = useTheme()
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, { borderColor: pressed ? colors.fg : colors.line, backgroundColor: colors.surface }]}
    >
      <View style={[styles.icon, { backgroundColor: colors.surface2, borderColor: colors.line }]}>
        <Icon size={22} color={colors.primaryInk} strokeWidth={1.6} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="label">{tag}</Text>
        <Text variant="h2">{title}</Text>
        <Text variant="small" tone="muted">{body}</Text>
      </View>
      <ChevronRight size={20} color={colors.muted} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderWidth: 1, borderRadius: radius.lg },
  icon: { width: 48, height: 48, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
})
