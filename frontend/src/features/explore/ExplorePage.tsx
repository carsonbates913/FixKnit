import { Search, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useInspirationSearch } from '@/api/hooks'
import { colorValues, techniqueValues, type Color, type Technique } from '@/api/schema'
import { ErrorNotice } from '@/components/ErrorNotice'
import { ImageGrid } from '@/components/ImageGrid'
import { LoadingYarn } from '@/components/LoadingYarn'
import { SectionHeading } from '@/components/SectionHeading'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { SearchFilters } from './SearchFilters'

const SUGGESTIONS = ['elbow patch', 'daisies', 'sashiko', 'granny square', 'visible mending', 'darned socks']

function pick<T extends string>(values: string[], allowed: readonly T[]): T[] {
  return values.filter((v): v is T => (allowed as readonly string[]).includes(v))
}

/** Search state lives in the URL so results are shareable and survive navigation. */
export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const techniques = pick<Technique>(searchParams.getAll('technique'), techniqueValues)
  const colors = pick<Color>(searchParams.getAll('color'), colorValues)

  const [draft, setDraft] = useState(q)
  useEffect(() => setDraft(q), [q])

  const search = useInspirationSearch(q ? { q, techniques, colors } : null)
  const filterCount = techniques.length + colors.length

  function update(next: { q?: string; techniques?: Technique[]; colors?: Color[] }) {
    const params = new URLSearchParams()
    const query = (next.q ?? q).trim()
    if (query) params.set('q', query)
    for (const t of next.techniques ?? techniques) params.append('technique', t)
    for (const c of next.colors ?? colors) params.append('color', c)
    setSearchParams(params, { replace: next.q === undefined })
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    update({ q: draft })
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:py-16">
      <SectionHeading
        as="h1"
        eyebrow="Explore"
        title="Find a design for your repair"
        description="Search knitted, crocheted and embroidered repairs. Filter by technique and colour to match your garment."
      />

      <div className="grid gap-6 rounded-lg border bg-surface p-4 sm:p-6">
        <form onSubmit={handleSubmit} role="search" className="flex flex-wrap gap-2">
          <label className="relative min-w-0 flex-1 basis-64">
            <span className="sr-only">Search designs</span>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.6} />
            <Input
              type="search"
              placeholder="Try “elbow patch” or “daisies”"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="pl-11"
            />
          </label>
          <Button type="submit" size="lg" disabled={!draft.trim()}>
            Search
          </Button>
        </form>
        <SearchFilters
          techniques={techniques}
          colors={colors}
          onTechniquesChange={(value) => update({ techniques: value })}
          onColorsChange={(value) => update({ colors: value })}
        />
        {filterCount > 0 && (
          <Button variant="link" size="sm" className="justify-self-start" onClick={() => update({ techniques: [], colors: [] })}>
            <X /> Clear {filterCount} {filterCount === 1 ? 'filter' : 'filters'}
          </Button>
        )}
      </div>

      {!q && (
        <div className="grid gap-3">
          <span className="eyebrow">Popular searches</span>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <Button key={s} variant="secondary" size="sm" onClick={() => update({ q: s })}>
                {s}
              </Button>
            ))}
          </div>
        </div>
      )}

      {q && (
        <section className="grid gap-4" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-3">
            <h2 className="text-lg font-semibold tracking-[-0.01em]">Results for “{q}”</h2>
            {search.data && (
              <span className="font-mono text-xs text-muted-foreground">
                {search.data.images.length} designs · query “{search.data.query}”
              </span>
            )}
          </div>
          {search.isFetching && <LoadingYarn label="Finding designs…" />}
          {search.isError && <ErrorNotice error={search.error} />}
          {search.data && !search.isFetching && <ImageGrid images={search.data.images} />}
        </section>
      )}
    </div>
  )
}
