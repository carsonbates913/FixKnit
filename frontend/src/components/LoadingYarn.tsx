import yarnBall from '@/assets/yarnball.svg'

export function LoadingYarn({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-4 py-12 text-muted-foreground">
      <img src={yarnBall} alt="" className="size-16 animate-yarn" />
      <span className="text-lg">{label}</span>
    </div>
  )
}
