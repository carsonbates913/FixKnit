import createClient from 'openapi-fetch'

import type { paths } from './schema'

/** Empty base URL: requests go to /api on the same origin (proxied to FastAPI in dev). */
export const api = createClient<paths>({ baseUrl: import.meta.env.VITE_API_URL ?? '' })

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
    throw new ApiError("Can't reach the FixKnit server. Is the API running?", 0)
  }
  if (result.data === undefined) {
    throw new ApiError(errorMessage(result.error, result.response.status), result.response.status)
  }
  return result.data
}

function errorMessage(error: unknown, status: number): string {
  const detail = (error as { detail?: unknown } | undefined)?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join('; ')
  }
  // A 5xx without a FastAPI body usually means the dev proxy couldn't reach the API.
  if (status >= 500) return "The FixKnit server isn't responding. Is the API running?"
  return `Request failed (HTTP ${status})`
}
