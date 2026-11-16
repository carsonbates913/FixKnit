import type { LucideIcon } from 'lucide-react-native'
import { StyleSheet, View } from 'react-native'

import { useTheme } from '@/theme/ThemeProvider'
import { radius } from '@/theme/tokens'

import { Text } from './Text'

type Tone = 'primary' | 'signal' | 'warn' | 'neutral'

export function Badge({ label, detail, tone = 'primary', icon: Icon }: { label: string; detail?: string; tone?: Tone; icon?: LucideIcon }) {
  const { colors } = useTheme()
  const map = {
    primary: [colors.primarySoft, colors.primaryInk],
    signal: [colors.signalSoft, colors.signalInk],
    warn: [colors.warnSoft, colors.warnInk],
    neutral: [colors.surface2, colors.muted],
  } as const
  const [bg, fg] = map[tone]
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: tone === 'neutral' ? colors.line : bg }]}>
      {Icon && <Icon size={13} color={fg} strokeWidth={2} />}
      <Text variant="smallMedium" style={{ color: fg, fontSize: 13 }}>{label}</Text>
      {detail && <Text variant="data" style={{ color: fg, opacity: 0.8, fontSize: 12 }}>{detail}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 26, paddingHorizontal: 9, borderRadius: radius.sm, borderWidth: 1, alignSelf: 'flex-start' },
})
