import { ArrowRight, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useInspirationSearch } from '@/api/hooks'
import type { AnalysisResult } from '@/api/schema'
import { ErrorNotice, Notice } from '@/components/ErrorNotice'
import { ImageGrid } from '@/components/ImageGrid'
import { LoadingYarn } from '@/components/LoadingYarn'
import { SectionHeading } from '@/components/SectionHeading'
import { UploadDropzone } from '@/components/UploadDropzone'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AnalysisReport } from './AnalysisReport'
import { RawLabels, RepairGuides } from './RepairGuides'
import { useRepairFlow } from './useRepairFlow'

const STATUS_EYEBROW = {
  idle: 'Repair',
  analyzing: 'Repair · analysing',
  error: 'Repair · failed',
  result: 'Repair · analysis complete',
} as const

export function RepairPage() {
  const { flow, start, reset } = useRepairFlow()

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          as="h1"
          eyebrow={STATUS_EYEBROW[flow.status]}
          title="Garment repair"
          description={
            flow.status === 'idle'
              ? 'Upload one clear photo of the damage. FixKnit identifies the garment and material, then shows you how to fix it.'
              : undefined
          }
        />
        {flow.status !== 'idle' && flow.status !== 'analyzing' && (
          <Button variant="secondary" onClick={reset}>
            <RotateCcw /> Try another photo
          </Button>
        )}
      </div>

      {flow.status === 'idle' && (
        <div className="grid gap-4">
          <UploadDropzone onSelect={start} />
          <Notice tone="signal" title="Tip">
            Photograph the damage flat, in daylight, with a coin beside it for scale.
          </Notice>
        </div>
      )}

      {flow.status !== 'idle' && (
        <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <figure className="overflow-hidden rounded-lg border bg-surface-2 shadow-md">
            <img src={flow.previewUrl} alt="Your garment" className="max-h-[34rem] w-full object-contain" />
          </figure>

          <div className="grid min-w-0 gap-6">
            {flow.status === 'analyzing' && <LoadingYarn label="Analysing your garment…" />}
            {flow.status === 'error' && (
              <ErrorNotice error={flow.error} action={<Button size="sm" onClick={reset}>Try again</Button>} />
            )}
            {flow.status === 'result' && (
              <>
                <AnalysisReport result={flow.result} />
                <Tabs defaultValue="guide">
                  <TabsList>
                    <TabsTrigger value="guide">Repair guide</TabsTrigger>
                    <TabsTrigger value="labels">
                      All labels <span className="font-mono text-[11px] opacity-70">{flow.result.labels.length}</span>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="guide">
                    <RepairGuides guides={flow.result.repair_guides} />
                  </TabsContent>
                  <TabsContent value="labels">
                    <RawLabels labels={flow.result.labels} />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      )}

      {flow.status === 'result' && <Inspiration result={flow.result} />}
    </div>
  )
}

function Inspiration({ result }: { result: AnalysisResult }) {
  const subject = result.garments[0]?.garment ?? result.materials[0]?.material
  const search = useInspirationSearch(subject ? { q: subject } : null)

  if (!subject) return null

  return (
    <section className="grid gap-6 border-t pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Inspiration" title={`Repair ideas for your ${subject}`} />
        <Button asChild variant="ghost">
          <Link to={`/explore?q=${encodeURIComponent(subject)}`}>
            See all designs <ArrowRight />
          </Link>
        </Button>
      </div>
      {search.isFetching && <LoadingYarn label="Finding designs…" />}
      {search.isError && <ErrorNotice error={search.error} />}
      {search.data && <ImageGrid images={search.data.images} />}
    </section>
  )
}
