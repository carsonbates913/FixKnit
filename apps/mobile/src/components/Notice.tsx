import { CircleAlert, Sparkles } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { useTheme } from '@/theme/ThemeProvider'
import { radius } from '@/theme/tokens'

import { Text } from './Text'

export function Notice({ title, children, tone = 'danger' }: { title: string; children?: ReactNode; tone?: 'danger' | 'signal' }) {
  const { colors } = useTheme()
  const [bg, fg, border] = tone === 'danger' ? [colors.dangerSoft, colors.dangerInk, colors.danger] : [colors.signalSoft, colors.signalInk, colors.signal]
  const Icon = tone === 'danger' ? CircleAlert : Sparkles
  return (
    <View accessibilityRole={tone === 'danger' ? 'alert' : undefined} style={[styles.box, { backgroundColor: bg, borderColor: border + '55' }]}>
      <Icon size={16} color={fg} strokeWidth={1.8} style={{ marginTop: 2 }} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="smallMedium" style={{ color: fg }}>{title}</Text>
        {children ? <Text variant="small" style={{ color: fg }}>{children}</Text> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: radius.md, borderWidth: 1 },
})
