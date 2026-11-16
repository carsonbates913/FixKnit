import createClient from 'openapi-fetch'

import { API_URL } from '@/lib/env'
import { supabase } from '@/lib/supabase'

import type { paths } from './schema'

export const api = createClient<paths>({ baseUrl: API_URL })

api.use({
  async onRequest({ request }) {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (token) request.headers.set('Authorization', `Bearer ${token}`)
    return request
  },
})

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type Result<T> = { data?: T; error?: unknown; response: Response }

/** Await an openapi-fetch call, returning its data or throwing an ApiError with a readable message. */
export async function unwrap<T>(request: Promise<Result<T>>): Promise<T> {
  let result: Result<T>
  try {
    result = await request
  } catch {
    throw new ApiError("Can't reach FixKnit. Check your connection and try again.", 0)
  }
  if (result.response.status === 204) return undefined as T
  if (result.data === undefined) {
    throw new ApiError(errorMessage(result.error, result.response.status), result.response.status)
  }
  return result.data
}

function errorMessage(error: unknown, status: number): string {
  const detail = (error as { detail?: unknown } | undefined)?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((d: { msg?: string }) => d.msg?.replace(/^Value error, /, ''))
      .filter(Boolean)
      .join('; ')
  }
  if (status >= 500) return 'FixKnit is having trouble right now. Try again in a moment.'
  return `Request failed (HTTP ${status})`
}
