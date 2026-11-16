import { colorValues, techniqueValues, type Color, type Technique } from '@/api/schema'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { titleCase } from '@/lib/format'

interface SearchFiltersProps {
  techniques: Technique[]
  colors: Color[]
  onTechniquesChange: (value: Technique[]) => void
  onColorsChange: (value: Color[]) => void
}

export function SearchFilters({ techniques, colors, onTechniquesChange, onColorsChange }: SearchFiltersProps) {
  return (
    <fieldset className="flex w-full flex-col items-center gap-2">
      <legend className="mb-2 w-full border-b pb-1 text-center text-lg">Filters</legend>
      <FilterGroup label="Technique" options={techniqueValues} value={techniques} onChange={onTechniquesChange} />
      <FilterGroup label="Colour" options={colorValues} value={colors} onChange={onColorsChange} />
    </fieldset>
  )
}

interface FilterGroupProps<T extends string> {
  label: string
  options: readonly T[]
  value: T[]
  onChange: (value: T[]) => void
}

function FilterGroup<T extends string>({ label, options, value, onChange }: FilterGroupProps<T>) {
  return (
    <ToggleGroup
      type="multiple"
      aria-label={label}
      value={value}
      onValueChange={(next) => onChange(next as T[])}
      className="flex flex-wrap justify-center gap-1"
    >
      {options.map((option) => (
        <ToggleGroupItem key={option} value={option} className="px-3 text-base">
          {titleCase(option)}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
