import { Camera, Images } from 'lucide-react-native'
import { View } from 'react-native'

import type { PhotoSource } from '@/lib/photos'

import { Button } from './Button'

export function PhotoSourceButtons({ onPick, disabled }: { onPick: (source: PhotoSource) => void; disabled?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Button label="Camera" icon={Camera} size="lg" style={{ flex: 1 }} disabled={disabled} onPress={() => onPick('camera')} />
      <Button label="Photos" icon={Images} size="lg" variant="tonal" style={{ flex: 1 }} disabled={disabled} onPress={() => onPick('library')} />
    </View>
  )
}
