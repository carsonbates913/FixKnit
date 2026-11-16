import * as ImagePicker from 'expo-image-picker'
import { Platform } from 'react-native'

export type PhotoSource = 'camera' | 'library'

/** Ask for a photo from the camera or library. Returns the picked assets, or [] if cancelled. */
export async function pickPhotos(source: PhotoSource, max = 1): Promise<ImagePicker.ImagePickerAsset[]> {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    quality: 0.85,
    allowsMultipleSelection: max > 1,
    selectionLimit: max,
  }
  if (source === 'camera') {
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestCameraPermissionsAsync()
      if (!permission.granted) throw new Error('Camera access is off. Turn it on in Settings, or choose a photo instead.')
    }
    const result = await ImagePicker.launchCameraAsync(options)
    return result.canceled ? [] : result.assets
  }
  const result = await ImagePicker.launchImageLibraryAsync(options)
  return result.canceled ? [] : result.assets.slice(0, max)
}
