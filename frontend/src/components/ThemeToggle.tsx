import { Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

type Theme = 'system' | 'light' | 'dark'
const ORDER: Theme[] = ['system', 'light', 'dark']
const ICONS = { system: Monitor, light: Sun, dark: Moon }
const STORAGE_KEY = 'fixknit-theme'

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'light' || saved === 'dark' ? saved : 'system'
  } catch {
    return 'system'
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') delete root.dataset.theme
    else root.dataset.theme = theme
    try {
      if (theme === 'system') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Storage unavailable: the choice lasts for this visit only.
    }
  }, [theme])

  const Icon = ICONS[theme]
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]!

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-9"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${theme}. Switch to ${next}.`}
      title={`Theme: ${theme}`}
    >
      <Icon strokeWidth={1.6} />
    </Button>
  )
}
