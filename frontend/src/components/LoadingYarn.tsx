import greenYarn from '@/assets/green-yarn.webp'

export function LoadingYarn({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={`flex flex-col items-center gap-4 py-12 ${className ?? ''}`}>
      <img src={greenYarn} alt="" className="size-16 animate-yarn drop-shadow-[0_12px_14px_rgb(10_40_25/0.25)]" />
      <span className="font-mono text-xs tracking-[0.06em] text-muted-foreground uppercase">{label}</span>
      <span className="relative h-1 w-44 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <span className="sheen absolute inset-y-0 w-2/5 animate-progress rounded-full bg-primary" />
      </span>
    </div>
  )
}
