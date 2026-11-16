import type { AnalysisResult } from '@/api/schema'
import { Badge } from '@/components/ui/badge'
import { percent, titleCase } from '@/lib/format'

export function AnalysisReport({ result }: { result: AnalysisResult }) {
  return (
    <dl className="flex flex-col gap-6">
      <ReportRow
        term="Item"
        items={result.garments.map((g) => ({ label: g.garment, confidence: g.confidence }))}
        emptyText="We couldn't tell what kind of garment this is."
      />
      <ReportRow
        term="Material"
        items={result.materials.map((m) => ({ label: m.material, confidence: m.confidence }))}
        emptyText="We couldn't identify the material."
      />
    </dl>
  )
}

interface ReportRowProps {
  term: string
  items: { label: string; confidence: number }[]
  emptyText: string
}

function ReportRow({ term, items, emptyText }: ReportRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="text-3xl">{term}</dt>
      <dd className="flex flex-wrap gap-2">
        {items.length === 0 ? (
          <span className="text-muted-foreground">{emptyText}</span>
        ) : (
          items.map((item, index) => (
            <Badge key={item.label} variant={index === 0 ? 'default' : 'secondary'} className="text-base">
              {titleCase(item.label)} <span className="opacity-75">{percent(item.confidence)}</span>
            </Badge>
          ))
        )}
      </dd>
    </div>
  )
}
