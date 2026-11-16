import { Image } from 'expo-image'
import { router } from 'expo-router'
import { StyleSheet, View } from 'react-native'

import { useProjects } from '@/api/hooks'
import type { ProjectOut } from '@/api/schema'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Notice } from '@/components/Notice'
import { Screen } from '@/components/Screen'
import { Eyebrow, Text } from '@/components/Text'
import { Appear, PressScale } from '@/components/Motion'
import { ProjectRowSkeleton } from '@/components/Skeleton'
import { mediaUrl } from '@/lib/env'
import { PROJECT_STATUS } from '@/lib/status'
import { useTheme } from '@/theme/ThemeProvider'
import { radius } from '@/theme/tokens'

export default function Projects() {
  const projects = useProjects()
  return (
    <Screen refreshing={projects.isRefetching} onRefresh={() => projects.refetch()}>
      <View style={{ gap: 6 }}>
        <Eyebrow>Projects</Eyebrow>
        <Text variant="h1">Your repairs</Text>
      </View>
      {projects.isPending && [0, 1, 2].map((i) => <ProjectRowSkeleton key={i} />)}
      {projects.isError && <Notice title="Couldn’t load projects">{projects.error.message}</Notice>}
      {projects.data?.length === 0 && (
        <Appear style={{ gap: 12, paddingVertical: 24 }}>
        <View style={{ gap: 12, paddingVertical: 24 }}>
          <Text variant="title">No repairs yet</Text>
          <Text variant="body" tone="muted">Photograph something that needs fixing and FixKnit will suggest how to repair it.</Text>
          <Button label="Fix something" onPress={() => router.push('/fix')} />
        </View>
        </Appear>
      )}
      {projects.data?.map((p, i) => (
        <Appear key={p.id} index={i}>
          <ProjectRow project={p} />
        </Appear>
      ))}
    </Screen>
  )
}

function ProjectRow({ project }: { project: ProjectOut }) {
  const { colors } = useTheme()
  const status = PROJECT_STATUS[project.status]
  const total = project.plan.steps.length
  return (
    <PressScale
      accessibilityRole="button"
      onPress={() => router.push(`/project/${project.id}`)}
      scaleTo={0.98}
      style={[styles.row, { borderColor: colors.line, backgroundColor: colors.surface }]}
    >
      {project.before_photo ? (
        <Image source={{ uri: mediaUrl(project.before_photo.url) }} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={[styles.thumb, { backgroundColor: colors.surface2 }]} />
      )}
      <View style={{ flex: 1, gap: 6 }}>
        <Text variant="title" numberOfLines={2}>{project.title}</Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Badge label={status.label} tone={status.tone} />
          <Text variant="data" tone="muted">{project.steps_done.length}/{total} steps</Text>
        </View>
      </View>
    </PressScale>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14, padding: 12, borderWidth: 1, borderRadius: radius.lg, alignItems: 'center' },
  thumb: { width: 64, height: 64, borderRadius: radius.md },
})
