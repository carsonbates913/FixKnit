import type { InspirationImage } from '@/api/schema'

function hostname(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

export function ImageGrid({ images }: { images: InspirationImage[] }) {
  if (images.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
        No designs found. Try a broader search or fewer filters.
      </p>
    )
  }

  return (
    <ul className="grid w-full grid-cols-[repeat(auto-fill,minmax(min(200px,100%),1fr))] gap-4">
      {images.map((image) => (
        <li key={image.url} className="min-w-0">
          <a
            href={image.source_url ?? image.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group grid gap-2 rounded-lg focus-visible:outline-offset-4"
          >
            <span className="relative block aspect-square overflow-hidden rounded-lg border bg-surface-2 shadow-sm transition-[transform,box-shadow] duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
              <img
                src={image.thumbnail_url ?? image.url}
                alt={image.title}
                loading="lazy"
                className="size-full object-cover"
              />
              <span className="sheen pointer-events-none absolute inset-0" aria-hidden="true" />
            </span>
            <span className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-semibold">{image.title}</span>
              {hostname(image.source_url) && (
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{hostname(image.source_url)}</span>
              )}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}
