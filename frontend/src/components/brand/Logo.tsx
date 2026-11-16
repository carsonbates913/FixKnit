import { cn } from '@/lib/utils'

// Eight knit V-stitches on a 3 × 5 grid form an F. The cobalt stitch is the repair.
const STITCHES: [col: number, row: number][] = [
  [0, 0], [1, 0], [2, 0], [0, 1], [0, 2], [1, 2], [0, 3], [0, 4],
]

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 46 48"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-6 text-primary-ink', className)}
    >
      {STITCHES.map(([col, row]) => (
        <path
          key={`${col}-${row}`}
          d={`M${4 + col * 13} ${4 + row * 8.2}l5 6.4 5-6.4`}
          className={col === 2 && row === 0 ? 'stroke-signal' : undefined}
        />
      ))}
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-foreground', className)}>
      <LogoMark />
      <span className="text-[19px] leading-none font-bold tracking-[-0.04em]">FixKnit</span>
    </span>
  )
}
