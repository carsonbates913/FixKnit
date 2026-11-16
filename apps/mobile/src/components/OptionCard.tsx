import { Check, Clock } from 'lucide-react-native'
import { Pressable, StyleSheet, View } from 'react-native'

import type { RepairOption } from '@/api/schema'
import { minutes, titleCase } from '@/lib/format'
import { useTheme } from '@/theme/ThemeProvider'
import { radius } from '@/theme/tokens'

import { Badge } from './Badge'
import { Text } from './Text'

const DIFFICULTY = ['Easy', 'Moderate', 'Advanced']

export function OptionCard({ option, selected, onPress, rank }: { option: RepairOption; selected: boolean; onPress: () => void; rank: number }) {
  const { colors } = useTheme()
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.card, { borderColor: selected ? colors.primary : colors.line, backgroundColor: selected ? colors.primarySoft : colors.surface }]}
    >
      <View style={styles.top}>
        <Text variant="label">Option {rank}</Text>
        <View style={[styles.radio, { borderColor: selected ? colors.primary : colors.lineStrong, backgroundColor: selected ? colors.primary : 'transparent' }]}>
          {selected && <Check size={13} color={colors.onPrimary} strokeWidth={3} />}
        </View>
      </View>
      <Text variant="h2">{option.title}</Text>
      <Text variant="small" tone="muted">{option.summary}</Text>
      <View style={styles.meta}>
        <Badge label={option.visibility === 'visible' ? 'Visible mend' : 'Invisible mend'} tone={option.visibility === 'visible' ? 'signal' : 'neutral'} />
        {option.technique && <Badge label={titleCase(option.technique)} tone="neutral" />}
        <Badge label={DIFFICULTY[option.difficulty - 1] ?? 'Moderate'} tone="neutral" />
        <Badge label={minutes(option.minutes)} tone="neutral" icon={Clock} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: radius.lg, padding: 16, gap: 8 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
})
