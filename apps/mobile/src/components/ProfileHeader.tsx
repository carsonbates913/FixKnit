import { View } from 'react-native'

import type { ProfileOut } from '@/api/schema'
import { titleCase } from '@/lib/format'

import { Avatar } from './Avatar'
import { Badge } from './Badge'
import { Text } from './Text'

export function ProfileHeader({ profile, action }: { profile: ProfileOut; action?: React.ReactNode }) {
  return (
    <View style={{ gap: 14, marginBottom: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar name={profile.display_name} handle={profile.handle} size={64} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="h2">{profile.display_name}</Text>
          <Text variant="data" tone="muted">@{profile.handle}</Text>
        </View>
        {action}
      </View>
      {profile.bio ? <Text variant="body">{profile.bio}</Text> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <Text variant="data"><Text variant="data" style={{ fontFamily: 'JetBrainsMono_500Medium' }}>{profile.post_count}</Text> {profile.post_count === 1 ? 'post' : 'posts'}</Text>
        {profile.techniques.map((t) => <Badge key={t} label={titleCase(t)} tone="neutral" />)}
      </View>
    </View>
  )
}
