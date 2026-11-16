import { percent } from '@/lib/format'

export function ConfidenceMeter({ value, label }: { value: number; label: string }) {
  return (
    <div className="grid gap-1.5">
      <div className="flex justify-between font-mono text-[11px] tracking-[0.06em] text-muted-foreground uppercase">
        <span>{label}</span>
        <span className="text-foreground tabular-nums">{percent(value)}</span>
      </div>
      <div
        className="h-1 overflow-hidden rounded-full bg-line"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
      >
        <div className="h-full rounded-full bg-primary" style={{ width: percent(value) }} />
      </div>
    </div>
  )
}
