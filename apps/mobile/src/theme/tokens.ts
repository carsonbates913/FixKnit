/** FixKnit · Stitch Precision tokens, mirrored from frontend/src/styles/index.css. */

export const green = {
  50: '#EAFBF1', 100: '#C9F3DB', 200: '#95E6B8', 300: '#5BD391', 400: '#29BB6C',
  500: '#109E56', 600: '#0A8046', 700: '#096539', 800: '#094F2D', 900: '#073B22',
} as const

const light = {
  bg: '#FFFFFF',
  bg2: '#F6F7F6',
  surface: '#FFFFFF',
  surface2: '#F5F6F5',
  fg: '#0A0C0B',
  muted: '#5A615D',
  line: '#E4E7E5',
  lineStrong: '#CDD2CF',
  primary: '#0A8046',
  onPrimary: '#FFFFFF',
  primaryInk: '#087540',
  primarySoft: '#E6F7EE',
  signal: '#2C55E0',
  signalSoft: '#E7ECFD',
  signalInk: '#1D41BD',
  warn: '#B86E00',
  warnSoft: '#FFF3DF',
  warnInk: '#8A5200',
  danger: '#D1291F',
  dangerSoft: '#FDE9E7',
  dangerInk: '#A61F17',
  overlay: 'rgba(10,12,11,0.55)',
}

export type Palette = typeof light

const dark: Palette = {
  bg: '#0A0B0B',
  bg2: '#0F1110',
  surface: '#121514',
  surface2: '#171A19',
  fg: '#F0F2F1',
  muted: '#8F9792',
  line: '#222624',
  lineStrong: '#323735',
  primary: '#0E9452',
  onPrimary: '#FFFFFF',
  primaryInk: '#5BD391',
  primarySoft: 'rgba(41,187,108,0.14)',
  signal: '#7D9BFF',
  signalSoft: 'rgba(125,155,255,0.14)',
  signalInk: '#A9BDFF',
  warn: '#F2B04A',
  warnSoft: 'rgba(242,176,74,0.13)',
  warnInk: '#F6C97C',
  danger: '#FF6B5E',
  dangerSoft: 'rgba(255,107,94,0.13)',
  dangerInk: '#FF9C93',
  overlay: 'rgba(0,0,0,0.6)',
}

export const palettes = { light, dark }

/** One family per weight: React Native can't synthesise weights for custom fonts. */
export const fonts = {
  regular: 'HankenGrotesk_400Regular',
  medium: 'HankenGrotesk_500Medium',
  semibold: 'HankenGrotesk_600SemiBold',
  bold: 'HankenGrotesk_700Bold',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
} as const

export const radius = { sm: 3, md: 6, lg: 8, xl: 12, pill: 999 } as const

/** 4px grid. */
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 } as const
