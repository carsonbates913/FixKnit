import type { AnalysisResult } from '@/api/schema'
import { ConfidenceMeter } from '@/components/ConfidenceMeter'
import { Badge } from '@/components/ui/badge'
import { percent, titleCase } from '@/lib/format'

interface Detection {
  label: string
  confidence: number
}

export function AnalysisReport({ result }: { result: AnalysisResult }) {
  const garments = result.garments.map((g) => ({ label: g.garment, confidence: g.confidence }))
  const materials = result.materials.map((m) => ({ label: m.material, confidence: m.confidence }))
  const top = garments[0] ?? materials[0]

  return (
    <div className="grid gap-5 rounded-lg border bg-surface p-5">
      <dl className="grid gap-4">
        <ReportRow term="Item" items={garments} emptyText="Garment type not recognised" />
        <ReportRow term="Material" items={materials} emptyText="Material not recognised" />
      </dl>
      {top && <ConfidenceMeter label={`Confidence · ${top.label}`} value={top.confidence} />}
    </div>
  )
}

function ReportRow({ term, items, emptyText }: { term: string; items: Detection[]; emptyText: string }) {
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[88px_minmax(0,1fr)]">
      <dt className="eyebrow">{term}</dt>
      <dd className="flex flex-wrap gap-2">
        {items.length === 0 ? (
          <span className="text-sm text-muted-foreground">{emptyText}</span>
        ) : (
          items.map((item, index) => (
            <Badge key={item.label} variant={index === 0 ? 'primary' : 'neutral'}>
              {titleCase(item.label)}
              <span className="font-mono text-xs font-medium opacity-80 tabular-nums">{percent(item.confidence)}</span>
            </Badge>
          ))
        )}
      </dd>
    </div>
  )
}
