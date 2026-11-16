import { AlertCircle } from 'lucide-react'
import type { ReactNode } from 'react'

export function ErrorNotice({ error, children }: { error: Error; children?: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center"
    >
      <p className="flex items-center gap-2 text-destructive">
        <AlertCircle className="size-5" />
        {error.message}
      </p>
      {children}
    </div>
  )
}
