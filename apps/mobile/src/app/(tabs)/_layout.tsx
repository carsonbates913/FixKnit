import { Image } from 'expo-image'
import { Tabs } from 'expo-router'
import { useEffect } from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

import { craftIcons } from '@/lib/icons'
import { popSpring } from '@/theme/motion'
import { useTheme } from '@/theme/ThemeProvider'
import { fonts } from '@/theme/tokens'

/** Soft 3D tab icon: full colour and a little pop when selected, quieter when not. */
function TabIcon({ source, focused }: { source: number; focused: boolean }) {
  const scale = useSharedValue(focused ? 1 : 0.86)
  useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0.86, popSpring)
  }, [focused, scale])
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  return (
    <Animated.View style={[animated, { opacity: focused ? 1 : 0.62 }]}>
      <Image source={source} style={{ width: 32, height: 32 }} contentFit="contain" />
    </Animated.View>
  )
}

export default function TabsLayout() {
  const { colors } = useTheme()
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        tabBarActiveTintColor: colors.fg,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.line, height: 68, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11, marginTop: 2 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon source={craftIcons.home} focused={focused} /> }} />
      <Tabs.Screen name="create" options={{ title: 'Create', tabBarIcon: ({ focused }) => <TabIcon source={craftIcons.create} focused={focused} /> }} />
      <Tabs.Screen name="projects" options={{ title: 'Projects', tabBarIcon: ({ focused }) => <TabIcon source={craftIcons.projects} focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon source={craftIcons.profile} focused={focused} /> }} />
    </Tabs>
  )
}
