import { Image } from 'expo-image'
import { router } from 'expo-router'
import { AlertTriangle, RotateCcw } from 'lucide-react-native'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { useDiagnose, useStartProject } from '@/api/hooks'
import type { DiagnosisOut } from '@/api/schema'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Notice } from '@/components/Notice'
import { OptionCard } from '@/components/OptionCard'
import { PhotoSourceButtons } from '@/components/PhotoSourceButtons'
import { Screen } from '@/components/Screen'
import { StitchGrid } from '@/components/StitchGrid'
import { Eyebrow, Text } from '@/components/Text'
import { YarnLoader } from '@/components/YarnLoader'
import { mediaUrl } from '@/lib/env'
import { percent, titleCase } from '@/lib/format'
import { pickPhotos, type PhotoSource } from '@/lib/photos'
import { useTheme } from '@/theme/ThemeProvider'
import { radius } from '@/theme/tokens'

export default function Fix() {
  const diagnose = useDiagnose()
  const [pickError, setPickError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  async function pick(source: PhotoSource) {
    setPickError(null)
    try {
      const [asset] = await pickPhotos(source)
      if (!asset) return
      setPreview(asset.uri)
      diagnose.mutate(asset)
    } catch (e) {
      setPickError(e instanceof Error ? e.message : 'Couldn’t open the camera')
    }
  }

  function reset() {
    diagnose.reset()
    setPreview(null)
  }

  if (diagnose.data) return <DiagnosisView diagnosis={diagnose.data} onRetake={reset} />

  return (
    <Screen edges={['bottom']}>
      <View style={{ gap: 6 }}>
        <Eyebrow>Repair assistant</Eyebrow>
        <Text variant="h1">Photograph the damage</Text>
        <Text variant="body" tone="muted">Lay the garment flat in daylight. Get close enough that the hole or tear fills a third of the frame.</Text>
      </View>

      {preview ? (
        <Image source={{ uri: preview }} style={styles.preview} contentFit="cover" />
      ) : (
        <View style={styles.art}><StitchGrid style={StyleSheet.absoluteFill} /></View>
      )}

      {diagnose.isPending ? (
        <YarnLoader label="Analysing your garment…" />
      ) : (
        <>
          {diagnose.isError && <Notice title="Couldn’t analyse that photo">{diagnose.error.message}</Notice>}
          {pickError && <Notice title="Camera unavailable">{pickError}</Notice>}
          <PhotoSourceButtons onPick={pick} />
        </>
      )}
    </Screen>
  )
}

function DiagnosisView({ diagnosis, onRetake }: { diagnosis: DiagnosisOut; onRetake: () => void }) {
  const { colors } = useTheme()
  const start = useStartProject()
  const [selected, setSelected] = useState(diagnosis.options[0]?.id ?? '')

  async function begin() {
    const project = await start.mutateAsync({ diagnosis_id: diagnosis.id, option_id: selected })
    router.replace(`/project/${project.id}`)
  }

  return (
    <Screen edges={['bottom']}>
      <Image source={{ uri: mediaUrl(diagnosis.photo_url) }} style={styles.preview} contentFit="cover" />

      <View style={[styles.report, { borderColor: colors.line, backgroundColor: colors.surface }]}>
        <Eyebrow>Diagnosis</Eyebrow>
        <Row label="Item">
          {diagnosis.garment ? <Badge label={titleCase(diagnosis.garment)} detail={percent(diagnosis.garment_confidence)} /> : <Text variant="small" tone="muted">Not recognised</Text>}
        </Row>
        <Row label="Material">
          {diagnosis.material ? <Badge label={titleCase(diagnosis.material)} detail={percent(diagnosis.material_confidence)} /> : <Text variant="small" tone="muted">Not recognised</Text>}
        </Row>
        <Row label="Damage">
          {diagnosis.damages.length === 0 ? (
            <Text variant="small" tone="muted">None found</Text>
          ) : (
            diagnosis.damages.map((d, i) => (
              <Badge key={i} tone="warn" icon={AlertTriangle} label={`${titleCase(d.kind)} · ${d.location}`} detail={d.size_cm ? `${d.size_cm} cm` : undefined} />
            ))
          )}
        </Row>
      </View>

      {diagnosis.notes ? <Notice tone="signal" title="Note">{diagnosis.notes}</Notice> : null}

      <View style={{ gap: 6 }}>
        <Text variant="h2">Choose how to fix it</Text>
        <Text variant="small" tone="muted">Ranked for this damage. You can switch techniques later.</Text>
      </View>
      {diagnosis.options.map((option, i) => (
        <OptionCard key={option.id} option={option} rank={i + 1} selected={selected === option.id} onPress={() => setSelected(option.id)} />
      ))}

      {start.isError && <Notice title="Couldn’t start the project">{start.error.message}</Notice>}
      <View style={{ gap: 10 }}>
        <Button label="Start this repair" size="lg" block disabled={!selected} loading={start.isPending} onPress={begin} />
        <Button label="Try another photo" icon={RotateCcw} variant="ghost" block onPress={onRetake} />
      </View>
    </Screen>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View style={{ width: 76, paddingTop: 6 }}><Text variant="label">{label}</Text></View>
      <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  preview: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.lg },
  art: { width: '100%', aspectRatio: 4 / 3 },
  report: { borderWidth: 1, borderRadius: radius.lg, padding: 16, gap: 12 },
})
