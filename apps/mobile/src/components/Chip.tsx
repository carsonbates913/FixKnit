import { Pressable, StyleSheet } from 'react-native'

import { useTheme } from '@/theme/ThemeProvider'
import { radius } from '@/theme/tokens'

import { Text } from './Text'

/** A filter/selection chip. Selected chips invert to ink on paper. */
export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { colors } = useTheme()
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.fg : colors.surface,
          borderColor: selected ? colors.fg : colors.lineStrong,
        },
      ]}
    >
      <Text variant="small" style={{ color: selected ? colors.bg : colors.fg, fontFamily: 'HankenGrotesk_500Medium' }}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: { height: 34, paddingHorizontal: 12, borderRadius: radius.md, borderWidth: 1, justifyContent: 'center' },
})
