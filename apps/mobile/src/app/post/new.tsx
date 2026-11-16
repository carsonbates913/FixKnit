import type { ImagePickerAsset } from 'expo-image-picker'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { X } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { useCreatePost, useUploadPhoto } from '@/api/hooks'
import { techniqueValues, type Technique } from '@/api/schema'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { Field } from '@/components/Field'
import { Notice } from '@/components/Notice'
import { PhotoSourceButtons } from '@/components/PhotoSourceButtons'
import { Screen } from '@/components/Screen'
import { Eyebrow, Text } from '@/components/Text'
import { titleCase } from '@/lib/format'
import { techniqueIcon } from '@/lib/icons'
import { pickPhotos, type PhotoSource } from '@/lib/photos'
import { radius } from '@/theme/tokens'

const MAX_PHOTOS = 4

export default function NewPost() {
  const upload = useUploadPhoto()
  const create = useCreatePost()
  const [photos, setPhotos] = useState<ImagePickerAsset[]>([])
  const [caption, setCaption] = useState('')
  const [technique, setTechnique] = useState<Technique | null>(null)
  const [tags, setTags] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<string | null>(null)

  async function add(source: PhotoSource) {
    setError(null)
    try {
      const picked = await pickPhotos(source, MAX_PHOTOS - photos.length)
      setPhotos((current) => [...current, ...picked].slice(0, MAX_PHOTOS))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t open photos')
    }
  }

  async function submit() {
    setError(null)
    try {
      const media = []
      for (const [i, photo] of photos.entries()) {
        setStep(`Uploading photo ${i + 1} of ${photos.length}…`)
        media.push(await upload.mutateAsync(photo))
      }
      setStep('Posting…')
      const post = await create.mutateAsync({
        caption: caption.trim(),
        technique,
        tags: tags.split(/[\s,]+/).filter(Boolean),
        media: media.map((m) => ({ media_id: m.id, role: 'gallery' as const })),
      })
      router.replace(`/post/${post.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t share your post')
      setStep(null)
    }
  }

  return (
    <Screen edges={['bottom']}>
      <View style={{ gap: 6 }}>
        <Eyebrow>Post a creation</Eyebrow>
        <Text variant="h1">Show what you made</Text>
      </View>

      {photos.length > 0 && (
        <View style={styles.grid}>
          {photos.map((p, i) => (
            <View key={p.uri} style={styles.tile}>
              <Image source={{ uri: p.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove photo ${i + 1}`}
                onPress={() => setPhotos((all) => all.filter((x) => x !== p))}
                style={styles.remove}
                hitSlop={6}
              >
                <X size={14} color="#FFFFFF" strokeWidth={2.4} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
      {photos.length < MAX_PHOTOS && !step && (
        <View style={{ gap: 8 }}>
          <Text variant="label">{photos.length === 0 ? 'Add photos' : `Add more (${photos.length}/${MAX_PHOTOS})`}</Text>
          <PhotoSourceButtons onPick={add} />
        </View>
      )}

      <Field label="Caption" placeholder="My first granny-square cardigan!" multiline value={caption} onChangeText={setCaption} maxLength={2000} />

      <View style={{ gap: 10 }}>
        <Text variant="label">Technique</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {techniqueValues.map((t) => (
            <Chip key={t} icon={techniqueIcon[t]} label={titleCase(t)} selected={technique === t} onPress={() => setTechnique(technique === t ? null : t)} />
          ))}
        </View>
      </View>

      <Field label="Tags (optional)" placeholder="cardigan wool granny_square" autoCapitalize="none" autoCorrect={false} value={tags} onChangeText={setTags} hint="Separate with spaces" />

      {error && <Notice title="Couldn’t post">{error}</Notice>}
      <Button
        label={step ?? 'Share to the community'}
        size="lg"
        block
        disabled={photos.length === 0}
        loading={Boolean(step) && !error}
        onPress={submit}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { width: '48.5%', aspectRatio: 1, borderRadius: radius.md, overflow: 'hidden' },
  remove: { position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(10,12,11,0.7)', alignItems: 'center', justifyContent: 'center' },
})
