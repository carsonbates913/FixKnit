import { useId, useState, type DragEvent } from 'react'

import camera from '@/assets/camera.svg'
import { cn } from '@/lib/utils'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 10 * 1024 * 1024

interface UploadDropzoneProps {
  onSelect: (file: File) => void
}

export function UploadDropzone({ onSelect }: UploadDropzoneProps) {
  const inputId = useId()
  const [dragging, setDragging] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)

  function accept(file: File | undefined) {
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setProblem('Please choose a JPEG, PNG or WebP photo.')
    } else if (file.size > MAX_BYTES) {
      setProblem('That photo is over 10 MB. Please choose a smaller one.')
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

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex h-80 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-foreground/60 bg-surface transition-colors sm:h-[28rem]',
          'hover:border-brand hover:bg-brand-soft has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
          dragging && 'border-brand bg-brand-soft',
        )}
      >
        <img src={camera} alt="" className="size-14" />
        <span className="px-6 text-center text-xl">Upload a photo of your garment</span>
        <span className="px-6 text-center text-sm text-muted-foreground">
          Drag & drop, or click to choose · JPEG, PNG or WebP, up to 10 MB
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
      {problem && (
        <p role="alert" className="mt-3 text-center text-destructive">
          {problem}
        </p>
      )}
    </div>
  )
}
