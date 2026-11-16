import { useState } from 'react'
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native'

import { useTheme } from '@/theme/ThemeProvider'
import { fonts, radius } from '@/theme/tokens'

import { Text } from './Text'

interface FieldProps extends TextInputProps {
  label: string
  hint?: string
  error?: string | null
  prefix?: string
}

export function Field({ label, hint, error, prefix, multiline, style, ...props }: FieldProps) {
  const { colors } = useTheme()
  const [focused, setFocused] = useState(false)
  return (
    <View style={styles.wrap}>
      <Text variant="label">{label}</Text>
      <View
        style={[
          styles.box,
          {
            borderColor: error ? colors.danger : focused ? colors.primary : colors.lineStrong,
            backgroundColor: colors.surface,
            minHeight: multiline ? 96 : 48,
            alignItems: multiline ? 'flex-start' : 'center',
          },
        ]}
      >
        {prefix && <Text variant="body" tone="muted" style={{ paddingTop: multiline ? 12 : 0 }}>{prefix}</Text>}
        <TextInput
          placeholderTextColor={colors.muted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          style={[styles.input, { color: colors.fg, paddingTop: multiline ? 12 : 0, textAlignVertical: multiline ? 'top' : 'center' }, style]}
          {...props}
        />
      </View>
      {error ? (
        <Text variant="small" tone="dangerInk">{error}</Text>
      ) : hint ? (
        <Text variant="small" tone="muted">{hint}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  box: { flexDirection: 'row', borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 14, gap: 2 },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 16, minHeight: 46, outlineStyle: 'none' } as never,
})
