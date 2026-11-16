import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useColorScheme } from 'react-native'

import { palettes, type Palette } from './tokens'

export type Appearance = 'system' | 'light' | 'dark'
const KEY = 'fixknit-appearance'

function readAppearance(): Appearance {
  try {
    const value = globalThis.localStorage?.getItem(KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

interface ThemeValue {
  colors: Palette
  scheme: 'light' | 'dark'
  appearance: Appearance
  setAppearance: (value: Appearance) => void
}

const ThemeContext = createContext<ThemeValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme()
  const [appearance, setAppearanceState] = useState<Appearance>(readAppearance)
  const scheme = appearance === 'system' ? (system === 'dark' ? 'dark' : 'light') : appearance

  const value = useMemo<ThemeValue>(
    () => ({
      colors: palettes[scheme],
      scheme,
      appearance,
      setAppearance: (next) => {
        setAppearanceState(next)
        try {
          globalThis.localStorage?.setItem(KEY, next)
        } catch {
          // Not persisted; the choice lasts for this session.
        }
      },
    }),
    [scheme, appearance],
  )
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside ThemeProvider')
  return value
}
