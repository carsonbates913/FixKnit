import { Text as RNText, type TextProps, type TextStyle } from 'react-native'

import { useTheme } from '@/theme/ThemeProvider'
import { fonts } from '@/theme/tokens'

const VARIANTS = {
  display: { fontFamily: fonts.bold, fontSize: 44, lineHeight: 44, letterSpacing: -2 },
  h1: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 33, letterSpacing: -1.1 },
  h2: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 26, letterSpacing: -0.6 },
  title: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  smallMedium: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.monoMedium, fontSize: 11, lineHeight: 14, letterSpacing: 0.7, textTransform: 'uppercase' },
  data: { fontFamily: fonts.mono, fontSize: 13, lineHeight: 18 },
} satisfies Record<string, TextStyle>

export type TextVariant = keyof typeof VARIANTS
type Tone = 'fg' | 'muted' | 'primaryInk' | 'signalInk' | 'warnInk' | 'dangerInk' | 'onPrimary'

interface Props extends TextProps {
  variant?: TextVariant
  tone?: Tone
  center?: boolean
}

export function Text({ variant = 'body', tone, center, style, ...props }: Props) {
  const { colors } = useTheme()
  const color = colors[tone ?? (variant === 'label' ? 'muted' : 'fg')]
  return (
    <RNText
      style={[VARIANTS[variant], { color }, center && { textAlign: 'center' }, style]}
      maxFontSizeMultiplier={1.4}
      {...props}
    />
  )
}

/** Mono "// Eyebrow" label used above headings. */
export function Eyebrow({ children }: { children: string }) {
  return (
    <Text variant="label">
      <Text variant="label" tone="signalInk">
        {'// '}
      </Text>
      {children}
    </Text>
  )
}
