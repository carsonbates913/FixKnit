import { Image } from 'expo-image'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { Check, Share2 } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated'
import { Pressable, StyleSheet, View } from 'react-native'

import { useProject, useUpdateProject, useUploadPhoto } from '@/api/hooks'
import type { ProjectOut } from '@/api/schema'
import { Badge } from '@/components/Badge'
import { BeforeAfter } from '@/components/BeforeAfter'
import { Button } from '@/components/Button'
import { Field } from '@/components/Field'
import { Notice } from '@/components/Notice'
import { PhotoSourceButtons } from '@/components/PhotoSourceButtons'
import { Screen } from '@/components/Screen'
import { Eyebrow, Text } from '@/components/Text'
import { Appear } from '@/components/Motion'
import { ProjectSkeleton } from '@/components/Skeleton'
import { YarnLoader } from '@/components/YarnLoader'
import { mediaUrl } from '@/lib/env'
import { minutes, timeAgo, titleCase } from '@/lib/format'
import { pickPhotos, type PhotoSource } from '@/lib/photos'
import { PROJECT_STATUS } from '@/lib/status'
import { popSpring } from '@/theme/motion'
import { useTheme } from '@/theme/ThemeProvider'
import { radius } from '@/theme/tokens'

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const project = useProject(id)

  if (project.isPending) {
    return (
      <Screen edges={['bottom']}>
        <ProjectSkeleton />
      </Screen>
    )
  }
  if (project.isError) {
    return (
      <Screen edges={['bottom']}>
        <Notice title="Couldn’t load this project">{project.error.message}</Notice>
      </Screen>
    )
  }
  return <ProjectView project={project.data} />
}

function ProjectView({ project }: { project: ProjectOut }) {
  const { colors } = useTheme()
  const { patch, addUpdate, publish } = useUpdateProject(project.id)
  const upload = useUploadPhoto()
  const [note, setNote] = useState('')
  const [caption, setCaption] = useState('')
  const [error, setError] = useState<string | null>(null)

  const status = PROJECT_STATUS[project.status]
  const after = [...project.updates].reverse().find((u) => u.kind === 'after' && u.photo)
  const busy = upload.isPending || addUpdate.isPending

  function toggleStep(index: number) {
    const done = new Set(project.steps_done)
    if (done.has(index)) done.delete(index)
    else done.add(index)
    patch.mutate({ steps_done: [...done] })
  }

  async function logPhoto(kind: 'progress' | 'after', source: PhotoSource) {
    setError(null)
    try {
      const [asset] = await pickPhotos(source)
      if (!asset) return
      const media = await upload.mutateAsync(asset)
      await addUpdate.mutateAsync({ kind, note: note.trim(), media_id: media.id })
      setNote('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t save that photo')
    }
  }

  async function share() {
    const post = await publish.mutateAsync(caption.trim())
    router.replace(`/post/${post.id}`)
  }

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: status.label }} />
      <Appear style={{ gap: 8 }}>
        <Eyebrow>{`Project · ${status.label}`}</Eyebrow>
        <Text variant="h1">{project.title}</Text>
        <View style={styles.badges}>
          <Badge label={status.label} tone={status.tone} />
          {project.material && <Badge label={titleCase(project.material)} tone="neutral" />}
          <Badge label={minutes(project.plan.minutes)} tone="neutral" />
        </View>
      </Appear>

      {project.before_photo && after?.photo ? (
        <BeforeAfter before={project.before_photo.url} after={after.photo.url} aspectRatio={4 / 3} />
      ) : project.before_photo ? (
        <Image source={{ uri: mediaUrl(project.before_photo.url) }} style={styles.photo} contentFit="cover" />
      ) : null}

      <Appear index={1} style={[styles.panel, { borderColor: colors.line, backgroundColor: colors.surface }]}>
        <View style={styles.spread}>
          <Text variant="label">Steps</Text>
          <Text variant="data" tone="muted">
            {project.steps_done.length}/{project.plan.steps.length}
          </Text>
        </View>
        {project.plan.steps.map((step, i) => {
          const done = project.steps_done.includes(i)
          return (
            <Pressable
              key={i}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              onPress={() => toggleStep(i)}
              style={styles.step}
            >
              <CheckBox done={done} />
              <Text
                variant="body"
                style={{ flex: 1, color: done ? colors.muted : colors.fg, textDecorationLine: done ? 'line-through' : 'none' }}
              >
                {step}
              </Text>
            </Pressable>
          )
        })}
        <Text variant="label" style={{ marginTop: 6 }}>
          You’ll need
        </Text>
        <Text variant="small" tone="muted">
          {project.plan.materials.join(' · ')}
        </Text>
      </Appear>

      {project.updates.length > 0 && (
        <View style={{ gap: 10 }}>
          <Text variant="label">Timeline</Text>
          {project.updates.map((u, i) => (
            <Appear key={u.id} index={i} style={[styles.update, { borderColor: colors.line }]}>
              {u.photo && <Image source={{ uri: mediaUrl(u.photo.url) }} style={styles.thumb} contentFit="cover" />}
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="smallMedium">{u.kind === 'after' ? 'Finished' : 'Progress'}</Text>
                {u.note ? (
                  <Text variant="small" tone="muted">
                    {u.note}
                  </Text>
                ) : null}
                <Text variant="data" tone="muted" style={{ fontSize: 11 }}>
                  {timeAgo(u.created_at)}
                </Text>
              </View>
            </Appear>
          ))}
        </View>
      )}

      {error && <Notice title="Something went wrong">{error}</Notice>}

      {project.post_id ? (
        <Button label="View your post" block onPress={() => router.push(`/post/${project.post_id}`)} />
      ) : project.status === 'done' ? (
        <View style={{ gap: 12 }}>
          <Text variant="h2">Share it with the community</Text>
          <Field
            label="Caption"
            placeholder="Saved my favourite sweater with a woven darn."
            multiline
            value={caption}
            onChangeText={setCaption}
            maxLength={2000}
          />
          {publish.isError && <Notice title="Couldn’t share">{publish.error.message}</Notice>}
          <Button label="Share before & after" icon={Share2} size="lg" block loading={publish.isPending} onPress={share} />
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          <Field
            label="Note (optional)"
            placeholder="Finished the vertical threads"
            value={note}
            onChangeText={setNote}
            maxLength={1000}
          />
          {busy ? (
            <YarnLoader label="Saving photo…" />
          ) : (
            <>
              <Text variant="label">Add a progress photo</Text>
              <PhotoSourceButtons onPick={(s) => logPhoto('progress', s)} />
              <Text variant="label" style={{ marginTop: 6 }}>
                Finished? Add the result
              </Text>
              <PhotoSourceButtons onPick={(s) => logPhoto('after', s)} />
            </>
          )}
        </View>
      )}
    </Screen>
  )
}

/** Checkbox that pops when ticked. */
function CheckBox({ done }: { done: boolean }) {
  const { colors } = useTheme()
  const scale = useSharedValue(1)
  useEffect(() => {
    if (done) scale.value = withSequence(withSpring(1.25, popSpring), withSpring(1, popSpring))
  }, [done, scale])
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  return (
    <Animated.View
      style={[
        styles.box,
        { borderColor: done ? colors.primary : colors.lineStrong, backgroundColor: done ? colors.primary : 'transparent' },
        animated,
      ]}
    >
      {done && <Check size={13} color={colors.onPrimary} strokeWidth={3} />}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  spread: { flexDirection: 'row', justifyContent: 'space-between' },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.lg },
  panel: { borderWidth: 1, borderRadius: radius.lg, padding: 16, gap: 12 },
  step: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  box: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  update: { flexDirection: 'row', gap: 12, borderWidth: 1, borderRadius: radius.md, padding: 10, alignItems: 'center' },
  thumb: { width: 56, height: 56, borderRadius: radius.sm },
})
