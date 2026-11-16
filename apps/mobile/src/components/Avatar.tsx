import { View } from 'react-native'

import { green } from '@/theme/tokens'

import { Text } from './Text'

const SHADES = [green[600], '#2C55E0', green[800], '#8A5200', green[500], '#1D41BD']

/** Initials on a colour picked from the handle, so each maker is recognisable. */
export function Avatar({ name, handle, size = 36 }: { name: string; handle: string; size?: number }) {
  const shade = SHADES[[...handle].reduce((n, ch) => n + ch.charCodeAt(0), 0) % SHADES.length]
  const initials = name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: shade, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant="smallMedium" style={{ color: '#FFFFFF', fontSize: size * 0.38 }}>{initials}</Text>
    </View>
  )
}
