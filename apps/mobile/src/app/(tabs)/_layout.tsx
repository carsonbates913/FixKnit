import { Tabs } from 'expo-router'
import { FolderKanban, Home, PlusSquare, UserRound } from 'lucide-react-native'

import { useTheme } from '@/theme/ThemeProvider'
import { fonts } from '@/theme/tokens'

export default function TabsLayout() {
  const { colors } = useTheme()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryInk,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.line },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Home color={color} size={22} strokeWidth={1.7} /> }} />
      <Tabs.Screen name="create" options={{ title: 'Create', tabBarIcon: ({ color }) => <PlusSquare color={color} size={22} strokeWidth={1.7} /> }} />
      <Tabs.Screen name="projects" options={{ title: 'Projects', tabBarIcon: ({ color }) => <FolderKanban color={color} size={22} strokeWidth={1.7} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <UserRound color={color} size={22} strokeWidth={1.7} /> }} />
    </Tabs>
  )
}
