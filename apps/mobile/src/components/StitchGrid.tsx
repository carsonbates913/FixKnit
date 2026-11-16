import type { ViewStyle } from 'react-native'
import Svg, { Path, Text as SvgText } from 'react-native-svg'

import { useTheme } from '@/theme/ThemeProvider'
import { fonts } from '@/theme/tokens'

/** The brand motif: a knit stitch grid with a cobalt darned patch and crop marks around it. */
export function StitchGrid({ cols = 15, rows = 12, darn = [10, 8, 14, 11], style }: { cols?: number; rows?: number; darn?: [number, number, number, number]; style?: ViewStyle }) {
  const { colors } = useTheme()
  const [c0, r0, c1, r1] = darn
  const w = 28 + cols * 24
  const h = 30 + rows * 26
  const x0 = 28 + c0 * 24 - 10
  const y0 = 30 + r0 * 26 - 10
  const x1 = 28 + c1 * 24 + 24
  const y1 = 30 + r1 * 26 + 22

  const stitches = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const inDarn = col >= c0 && col <= c1 && row >= r0 && row <= r1
      stitches.push(
        <Path
          key={`${col}-${row}`}
          d={`M${28 + col * 24} ${30 + row * 26}l7 11 7-11`}
          stroke={inDarn ? colors.signal : colors.lineStrong}
          strokeWidth={inDarn ? 2.2 : 1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />,
      )
    }
  }
  return (
    <Svg viewBox={`0 0 ${w} ${h}`} style={style} preserveAspectRatio="xMidYMid meet" pointerEvents="none">
      {stitches}
      <Path
        d={`M${x0} ${y0 + 14}V${y0}h14M${x1 - 14} ${y0}h14v14M${x0} ${y1 - 14}V${y1}h14M${x1 - 14} ${y1}h14v-14`}
        stroke={colors.fg}
        strokeWidth={1}
        fill="none"
      />
      <SvgText x={x0} y={y0 - 8} fill={colors.muted} fontSize={10} fontFamily={fonts.mono}>
        DARN 5×4
      </SvgText>
    </Svg>
  )
}
