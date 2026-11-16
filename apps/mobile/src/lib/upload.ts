import type { ImagePickerAsset } from 'expo-image-picker'
import { Platform } from 'react-native'

/** Build multipart form data for a picked photo on native (file URI) or web (blob URL). */
export async function photoFormData(asset: ImagePickerAsset): Promise<FormData> {
  const form = new FormData()
  const type = asset.mimeType ?? 'image/jpeg'
  const name = asset.fileName ?? `photo.${type.split('/')[1] ?? 'jpg'}`
  if (Platform.OS === 'web') {
    const blob = asset.file ?? (await (await fetch(asset.uri)).blob())
    form.append('file', blob, name)
  } else {
    // React Native's FormData accepts a { uri, name, type } descriptor for files.
    form.append('file', { uri: asset.uri, name, type } as unknown as Blob)
  }
  return form
}
