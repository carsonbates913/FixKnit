import { useEffect, useState } from 'react'

import { useAnalyzeGarment } from '@/api/hooks'
import type { AnalysisResult } from '@/api/schema'

export type RepairFlow =
  | { status: 'idle' }
  | { status: 'analyzing'; previewUrl: string }
  | { status: 'error'; previewUrl: string; error: Error }
  | { status: 'result'; previewUrl: string; result: AnalysisResult }

/** Upload → analyze → result/error, with the photo preview kept alongside. */
export function useRepairFlow() {
  const analyze = useAnalyzeGarment()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  function start(file: File) {
    setPreviewUrl(URL.createObjectURL(file))
    analyze.mutate(file)
  }

  function reset() {
    analyze.reset()
    setPreviewUrl(null)
  }

  let flow: RepairFlow
  if (!previewUrl) flow = { status: 'idle' }
  else if (analyze.isError) flow = { status: 'error', previewUrl, error: analyze.error }
  else if (analyze.isSuccess) flow = { status: 'result', previewUrl, result: analyze.data }
  else flow = { status: 'analyzing', previewUrl }

  return { flow, start, reset }
}
