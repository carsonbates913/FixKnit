import { Image } from 'expo-image'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { Button } from '@/components/Button'
import { Logo } from '@/components/Logo'
import { Appear } from '@/components/Motion'
import { Notice } from '@/components/Notice'
import { Screen } from '@/components/Screen'
import { StitchGrid } from '@/components/StitchGrid'
import { Eyebrow, Text } from '@/components/Text'
import { useAuth } from '@/lib/auth'

const yarn = require('../../assets/green-yarn.webp')

export default function Welcome() {
  const { continueAsGuest } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function start() {
    setBusy(true)
    setError(null)
    try {
      await continueAsGuest()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setBusy(false)
    }
  }

  return (
    <Screen edges={['top', 'bottom']} contentStyle={{ justifyContent: 'space-between' }}>
      <Appear>
        <Logo />
      </Appear>
      <Appear index={1} style={styles.art}>
        <StitchGrid style={StyleSheet.absoluteFill} />
        <Image source={yarn} style={styles.yarn} contentFit="contain" accessibilityLabel="A green ball of yarn" />
      </Appear>
      <Appear index={2} style={{ gap: 14 }}>
        <Eyebrow>Clothing repair, measured</Eyebrow>
        <Text variant="display">Revive, repair, reimagine.</Text>
        <Text variant="body" tone="muted">
          Snap a damaged garment to get a repair plan, then share what you make with everyone here.
        </Text>
      </Appear>
      <Appear index={3} style={{ gap: 12 }}>
        {error && <Notice title="Couldn’t start a session">{error}</Notice>}
        <Button label="Continue as guest" size="lg" block loading={busy} onPress={start} />
        <Text variant="small" tone="muted" center>
          No email needed. Pick a display name on the next screen.
        </Text>
      </Appear>
    </Screen>
  )
}

const styles = StyleSheet.create({
  art: { width: '100%', aspectRatio: 1.15, maxHeight: 340, alignSelf: 'center' },
  yarn: { position: 'absolute', left: '4%', top: '2%', width: '54%', height: '66%' },
})
