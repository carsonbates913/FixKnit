import { colorValues, techniqueValues, type Color, type Technique } from '@/api/schema'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { titleCase } from '@/lib/format'

// Swatch colours for the colour filter chips (data, not theme).
const SWATCH: Record<Color, string> = {
  red: '#D23B3B', orange: '#E8832A', yellow: '#E6B530', green: '#2E9C5B', blue: '#2F6FD0',
  pink: '#E27BA6', purple: '#8457C9', brown: '#8A5A3C', black: '#1D1F1E', white: '#F4F4F2',
}

interface SearchFiltersProps {
  techniques: Technique[]
  colors: Color[]
  onTechniquesChange: (value: Technique[]) => void
  onColorsChange: (value: Color[]) => void
}

export function SearchFilters({ techniques, colors, onTechniquesChange, onColorsChange }: SearchFiltersProps) {
  return (
    <div className="grid gap-4">
      <FilterRow label="Technique">
        <ToggleGroup type="multiple" aria-label="Technique" value={techniques} onValueChange={(v) => onTechniquesChange(v as Technique[])}>
          {techniqueValues.map((t) => (
            <ToggleGroupItem key={t} value={t}>
              {titleCase(t)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FilterRow>
      <FilterRow label="Colour">
        <ToggleGroup type="multiple" aria-label="Colour" value={colors} onValueChange={(v) => onColorsChange(v as Color[])}>
          {colorValues.map((c) => (
            <ToggleGroupItem key={c} value={c}>
              <span className="size-2.5 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.18)]" style={{ background: SWATCH[c] }} />
              {titleCase(c)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FilterRow>
    </div>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-2 sm:grid-cols-[96px_minmax(0,1fr)]">
      <span className="eyebrow pt-2">{label}</span>
      {children}
    </div>
  )
}
