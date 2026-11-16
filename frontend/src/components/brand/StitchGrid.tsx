import { cn } from '@/lib/utils'

interface StitchGridProps {
  cols?: number
  rows?: number
  /** Inclusive [col0, row0, col1, row1] block drawn in cobalt as the "darn". */
  darn?: [number, number, number, number]
  label?: string
  className?: string
}

/** The brand motif: a knit stitch grid with a darned patch and crop marks around it. */
export function StitchGrid({ cols = 16, rows = 14, darn = [10, 9, 14, 12], label = 'Darn 5×4', className }: StitchGridProps) {
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
        <path
          key={`${col}-${row}`}
          d={`M${28 + col * 24} ${30 + row * 26}l7 11 7-11`}
          className={inDarn ? 'stroke-signal' : 'stroke-line-strong'}
          strokeWidth={inDarn ? 2.2 : 1.2}
        />,
      )
    }
  }

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('pointer-events-none', className)}
    >
      {stitches}
      <path
        className="stroke-foreground"
        strokeWidth={1}
        d={`M${x0} ${y0 + 14}V${y0}h14M${x1 - 14} ${y0}h14v14M${x0} ${y1 - 14}V${y1}h14M${x1 - 14} ${y1}h14v-14`}
      />
      <text x={x0} y={y0 - 8} className="fill-muted-foreground font-mono" fontSize={10}>
        {label.toUpperCase()}
      </text>
    </svg>
  )
}
