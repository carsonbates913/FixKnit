import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useInspirationSearch } from '@/api/hooks'
import { colorValues, techniqueValues, type Color, type Technique } from '@/api/schema'
import greenYarn from '@/assets/green-yarn.webp'
import { ErrorNotice } from '@/components/ErrorNotice'
import { ImageGrid } from '@/components/ImageGrid'
import { LoadingYarn } from '@/components/LoadingYarn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { SearchFilters } from './SearchFilters'

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
  const search = useInspirationSearch(q ? { q, techniques, colors } : null)

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
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-10">
      <div className="flex flex-col items-center gap-4 text-center">
        <img src={greenYarn} alt="" className="h-40" />
        <h1 className="max-w-xl text-4xl leading-tight sm:text-5xl">
          Explore designs to inspire your repairs
        </h1>
      </div>

      <form onSubmit={handleSubmit} role="search" className="flex w-full max-w-2xl flex-col items-center gap-4">
        <div className="flex w-full gap-2">
          <Input
            type="search"
            aria-label="Search designs"
            placeholder="Try “sweater elbow patch” or “flowers”"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="h-12 bg-surface text-lg md:text-lg"
          />
          <Button type="submit" size="lg" className="h-12" disabled={!draft.trim()}>
            <Search /> Search
          </Button>
        </div>
        <SearchFilters
          techniques={techniques}
          colors={colors}
          onTechniquesChange={(value) => update({ techniques: value })}
          onColorsChange={(value) => update({ colors: value })}
        />
      </form>

      {search.isFetching && <LoadingYarn label="Finding designs…" />}
      {search.isError && <ErrorNotice error={search.error} />}
      {search.data && !search.isFetching && <ImageGrid images={search.data.images} />}
    </div>
  )
}
