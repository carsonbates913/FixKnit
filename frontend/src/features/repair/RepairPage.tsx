import { RotateCcw } from 'lucide-react'
import { motion } from 'motion/react'

import { useInspirationSearch } from '@/api/hooks'
import type { AnalysisResult } from '@/api/schema'
import groupSweaters from '@/assets/group-sweaters.svg'
import { ErrorNotice } from '@/components/ErrorNotice'
import { ImageGrid } from '@/components/ImageGrid'
import { LoadingYarn } from '@/components/LoadingYarn'
import { UploadDropzone } from '@/components/UploadDropzone'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AnalysisReport } from './AnalysisReport'
import { RepairGuides } from './RepairGuides'
import { useRepairFlow } from './useRepairFlow'

export function RepairPage() {
  const { flow, start, reset } = useRepairFlow()

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 py-10 sm:py-14">
      <h1 className="text-4xl sm:text-5xl">Garment Repair</h1>

      {flow.status === 'idle' && (
        <>
          <img src={groupSweaters} alt="" className="h-40 sm:h-52" />
          <UploadDropzone onSelect={start} />
        </>
      )}

      {flow.status !== 'idle' && (
        <div className="grid w-full items-start gap-10 md:grid-cols-2">
          <motion.figure
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            <img
              src={flow.previewUrl}
              alt="Your garment"
              className="max-h-[32rem] w-full rounded-2xl bg-surface object-contain"
            />
            {flow.status !== 'analyzing' && (
              <Button variant="outline" onClick={reset}>
                <RotateCcw /> Try another photo
              </Button>
            )}
          </motion.figure>

          <div>
            {flow.status === 'analyzing' && <LoadingYarn label="Analysing your garment…" />}
            {flow.status === 'error' && (
              <ErrorNotice error={flow.error}>
                <Button onClick={reset}>Try again</Button>
              </ErrorNotice>
            )}
            {flow.status === 'result' && (
              <Tabs defaultValue="report">
                <TabsList>
                  <TabsTrigger value="report">Report</TabsTrigger>
                  <TabsTrigger value="repair">Repair</TabsTrigger>
                </TabsList>
                <TabsContent value="report" className="rounded-lg border p-6">
                  <AnalysisReport result={flow.result} />
                </TabsContent>
                <TabsContent value="repair" className="rounded-lg border p-6">
                  <RepairGuides guides={flow.result.repair_guides} />
                </TabsContent>
              </Tabs>
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
    <section className="flex w-full flex-col items-center gap-6">
      <h2 className="text-4xl">Inspiration</h2>
      {search.isFetching && <LoadingYarn label="Finding designs…" />}
      {search.isError && <ErrorNotice error={search.error} />}
      {search.data && <ImageGrid images={search.data.images} />}
    </section>
  )
}
