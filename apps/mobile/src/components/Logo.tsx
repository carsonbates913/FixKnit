import { View } from 'react-native'
import Svg, { Path } from 'react-native-svg'

import { useTheme } from '@/theme/ThemeProvider'

import { Text } from './Text'

// Eight knit V-stitches on a 3 × 5 grid form an F. The cobalt stitch is the repair.
const STITCHES: [number, number][] = [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2], [1, 2], [0, 3], [0, 4]]

export function LogoMark({ size = 24, color }: { size?: number; color?: string }) {
  const { colors } = useTheme()
  return (
    <Svg width={size} height={(size * 48) / 46} viewBox="0 0 46 48" fill="none">
      {STITCHES.map(([c, r]) => (
        <Path
          key={`${c}-${r}`}
          d={`M${4 + c * 13} ${4 + r * 8.2}l5 6.4 5-6.4`}
          stroke={c === 2 && r === 0 ? colors.signal : (color ?? colors.primaryInk)}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  )
}

export function Logo({ size = 20 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.4 }}>
      <LogoMark size={size * 1.2} />
      <Text variant="h2" style={{ fontSize: size, lineHeight: size * 1.1, letterSpacing: -size * 0.04 }}>FixKnit</Text>
    </View>
  )
}
