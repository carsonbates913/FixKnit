export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ')
}

export function percent(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const units: [number, string][] = [[60 * 60 * 24 * 7, 'w'], [60 * 60 * 24, 'd'], [60 * 60, 'h'], [60, 'm']]
  for (const [size, label] of units) if (seconds >= size) return `${Math.floor(seconds / size)}${label}`
  return 'just now'
}

export function minutes(total: number): string {
  if (total < 60) return `${total} min`
  const h = Math.floor(total / 60)
  const m = total % 60
  return m ? `${h} h ${m} min` : `${h} h`
}
