import { LogOut, Trash2 } from 'lucide-react-native'
import { useState } from 'react'
import { View } from 'react-native'

import { useDeleteAccount } from '@/api/hooks'
import { Button } from '@/components/Button'
import { Chip } from '@/components/Chip'
import { Notice } from '@/components/Notice'
import { Screen } from '@/components/Screen'
import { Eyebrow, Text } from '@/components/Text'
import { useAuth } from '@/lib/auth'
import { useTheme, type Appearance } from '@/theme/ThemeProvider'

const APPEARANCES: { value: Appearance; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export default function SettingsScreen() {
  const { appearance, setAppearance, colors } = useTheme()
  const { me, signOut } = useAuth()
  const deleteAccount = useDeleteAccount()
  const [confirming, setConfirming] = useState(false)

  async function remove() {
    await deleteAccount.mutateAsync()
    await signOut()
  }

  return (
    <Screen edges={['bottom']}>
      <Section title="Appearance">
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {APPEARANCES.map((a) => (
            <Chip key={a.value} label={a.label} selected={appearance === a.value} onPress={() => setAppearance(a.value)} />
          ))}
        </View>
      </Section>

      <Section title="Account">
        <Text variant="body">
          Signed in as <Text variant="bodyMedium">@{me?.profile?.handle}</Text>
        </Text>
        {me?.is_guest && (
          <Notice tone="signal" title="Guest account">
            Your posts are saved, but signing out on this device ends the session for good.
          </Notice>
        )}
        <Button label="Sign out" icon={LogOut} variant="secondary" onPress={signOut} />
      </Section>

      <Section title="Danger zone">
        <Text variant="small" tone="muted">
          Deleting your account removes your profile, posts, projects and photos. This can’t be undone.
        </Text>
        {deleteAccount.isError && <Notice title="Couldn’t delete your account">{deleteAccount.error.message}</Notice>}
        {confirming ? (
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <Button label="Delete everything" variant="danger" loading={deleteAccount.isPending} onPress={remove} />
            <Button label="Cancel" variant="ghost" onPress={() => setConfirming(false)} />
          </View>
        ) : (
          <Button label="Delete account" icon={Trash2} variant="ghost" style={{ borderColor: colors.danger }} onPress={() => setConfirming(true)} />
        )}
      </Section>
    </Screen>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 12 }}>
      <Eyebrow>{title}</Eyebrow>
      {children}
    </View>
  )
}
