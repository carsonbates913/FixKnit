export function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function percent(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}
