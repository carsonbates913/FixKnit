import { useMutation, useQuery } from '@tanstack/react-query'

import { api, unwrap } from './client'
import type { BodyAnalyzeGarment, Color, Technique } from './schema'

export function useAnalyzeGarment() {
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return unwrap(
        api.POST('/api/analysis', {
          // The generated type models the upload as a string; the real payload is the FormData.
          body: {} as BodyAnalyzeGarment,
          bodySerializer: () => form,
        }),
      )
    },
  })
}

export interface InspirationParams {
  q: string
  techniques?: Technique[]
  colors?: Color[]
}

export function useInspirationSearch(params: InspirationParams | null) {
  return useQuery({
    queryKey: ['inspiration', params],
    queryFn: () => unwrap(api.GET('/api/inspiration', { params: { query: params! } })),
    enabled: Boolean(params?.q.trim()),
    staleTime: 5 * 60 * 1000,
  })
}
