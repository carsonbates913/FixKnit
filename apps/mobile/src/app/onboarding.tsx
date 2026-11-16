import { useState } from 'react'
import { View } from 'react-native'

import { useSaveProfile } from '@/api/hooks'
import { techniqueValues, type Technique } from '@/api/schema'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { Field } from '@/components/Field'
import { Logo } from '@/components/Logo'
import { Screen } from '@/components/Screen'
import { Eyebrow, Text } from '@/components/Text'
import { useAuth } from '@/lib/auth'
import { titleCase } from '@/lib/format'

function suggestHandle(name: string): string {
  return name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 20)
}

export default function Onboarding() {
  const save = useSaveProfile()
  const { signOut } = useAuth()
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [handleEdited, setHandleEdited] = useState(false)
  const [techniques, setTechniques] = useState<Technique[]>([])

  const effectiveHandle = handleEdited ? handle : suggestHandle(name)
  const handleValid = /^[a-z0-9_]{3,20}$/.test(effectiveHandle)
  const canSubmit = name.trim().length > 0 && handleValid

  function toggle(t: Technique) {
    setTechniques((current) => (current.includes(t) ? current.filter((x) => x !== t) : [...current, t]))
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <Logo />
      <View style={{ gap: 8 }}>
        <Eyebrow>Welcome</Eyebrow>
        <Text variant="h1">What should we call you?</Text>
        <Text variant="body" tone="muted">This is how other makers will see your posts.</Text>
      </View>

      <Field label="Display name" placeholder="Sam Rivera" value={name} onChangeText={setName} autoFocus maxLength={40} returnKeyType="next" />
      <Field
        label="Handle"
        prefix="@"
        placeholder="sam_rivera"
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={20}
        value={effectiveHandle}
        onChangeText={(v) => {
          setHandleEdited(true)
          setHandle(v.toLowerCase())
        }}
        hint="3–20 letters, numbers or underscores"
        error={
          save.error?.message ??
          (effectiveHandle && !handleValid ? 'Use 3–20 lowercase letters, numbers or underscores' : null)
        }
      />

      <View style={{ gap: 10 }}>
        <Text variant="label">What do you make? (optional)</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {techniqueValues.map((t) => (
            <Chip key={t} label={titleCase(t)} selected={techniques.includes(t)} onPress={() => toggle(t)} />
          ))}
        </View>
      </View>

      <View style={{ gap: 10, marginTop: 'auto' }}>
        <Button
          label="Start making"
          size="lg"
          block
          disabled={!canSubmit}
          loading={save.isPending}
          onPress={() => save.mutate({ handle: effectiveHandle, display_name: name.trim(), bio: '', techniques })}
        />
        <Button label="Cancel" variant="ghost" block onPress={signOut} />
      </View>
    </Screen>
  )
}
