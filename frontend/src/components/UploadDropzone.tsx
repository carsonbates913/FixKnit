import { Camera, CircleAlert, Upload } from 'lucide-react'
import { useId, useState, type DragEvent } from 'react'

import { cn } from '@/lib/utils'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 10 * 1024 * 1024

export function UploadDropzone({ onSelect }: { onSelect: (file: File) => void }) {
  const inputId = useId()
  const [dragging, setDragging] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)

  function accept(file: File | undefined) {
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setProblem('That file isn’t a JPEG, PNG or WebP photo.')
    } else if (file.size > MAX_BYTES) {
      setProblem('That photo is over 10 MB. Choose a smaller one.')
    } else {
      setProblem(null)
      onSelect(file)
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    accept(event.dataTransfer.files[0])
  }

  const Icon = problem ? CircleAlert : dragging ? Upload : Camera

  return (
    <label
      htmlFor={inputId}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex min-h-72 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-[1.5px] border-dashed border-line-strong bg-surface-2 p-8 text-center transition-colors sm:min-h-80',
        'hover:border-primary hover:bg-primary-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal',
        dragging && 'border-primary bg-primary-soft',
        problem && 'border-danger bg-danger-soft',
      )}
    >
      <span
        className={cn(
          'grid size-13 place-items-center rounded-md border bg-surface shadow-sm',
          problem ? 'text-danger' : 'text-primary-ink',
        )}
      >
        <Icon className="size-6" strokeWidth={1.6} />
      </span>
      <span className="text-lg font-semibold tracking-[-0.01em]">
        {dragging ? 'Drop to upload' : 'Upload a photo of the damage'}
      </span>
      <span className={cn('text-sm', problem ? 'text-danger-ink' : 'text-muted-foreground')} role={problem ? 'alert' : undefined}>
        {problem ?? 'Drag & drop or click to choose · JPEG, PNG or WebP, up to 10 MB'}
      </span>
      <input
        id={inputId}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="sr-only"
        onChange={(event) => {
          accept(event.target.files?.[0])
          event.target.value = ''
        }}
      />
    </label>
  )
}
