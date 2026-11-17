import { HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_600SemiBold, HankenGrotesk_700Bold } from '@expo-google-fonts/hanken-grotesk'
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { SplashScreen } from 'expo-router'
import { Stack, type StackCardStyleInterpolator } from 'expo-router/js-stack'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { Easing, Platform } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { AuthProvider, useAuth } from '@/lib/auth'
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider'
import { fonts } from '@/theme/tokens'

SplashScreen.preventAutoHideAsync()

// Dev only: Expo's empty error-toast host on web can swallow taps on content near the bottom of
// the screen (the tab bar). Let taps through until it actually shows a toast.
if (__DEV__ && Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = '#error-toast:empty { pointer-events: none; }'
  document.head.appendChild(style)
}

/**
 * Page transition: the outgoing page fades out over the first half, then the incoming page fades
 * in over the second half while drifting up 8px. Runs on web, iOS and Android alike.
 */
const fadeThrough: StackCardStyleInterpolator = ({ current, next }) => ({
  cardStyle: {
    opacity: next
      ? next.progress.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0], extrapolate: 'clamp' })
      : current.progress.interpolate({ inputRange: [0.45, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
    transform: [{ translateY: current.progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
  },
})

const pageTiming = {
  animation: 'timing',
  config: { duration: 320, easing: Easing.bezier(0.2, 0.8, 0.2, 1) },
} as const

export default function RootLayout() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 15_000 } } }),
  )
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  })

  if (!fontsLoaded) return null

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Navigator />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}

function Navigator() {
  const { colors, scheme } = useTheme()
  const { session, restoring, me, meLoading } = useAuth()

  if (restoring || meLoading) return null
  SplashScreen.hide()

  const signedIn = Boolean(session)
  const hasProfile = Boolean(me?.profile)

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg, borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 },
          headerTintColor: colors.fg,
          headerTitleStyle: { fontFamily: fonts.semibold, fontSize: 16 },
          headerBackButtonDisplayMode: 'minimal',
          headerTitleAlign: 'center',
          // On web the JS stack lets cards grow (min-height: 100%) so the document scrolls; our screens
          // scroll themselves, so bound the card to the viewport instead.
          cardStyle: { backgroundColor: colors.bg, flex: 1 },
          // The JS stack disables animations on web by default; turn them on everywhere.
          animation: 'fade',
          cardStyleInterpolator: fadeThrough,
          transitionSpec: { open: pageTiming, close: pageTiming },
          gestureEnabled: false,
        }}
      >
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={signedIn && !hasProfile}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={signedIn && hasProfile}>
          {/* Tabs manage their own layout; keep the stack's default card for them. */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false, cardStyle: { backgroundColor: colors.bg } }} />
          <Stack.Screen name="fix" options={{ title: 'Fix something' }} />
          <Stack.Screen name="post/new" options={{ title: 'Post a creation' }} />
          <Stack.Screen name="post/[id]" options={{ title: 'Post' }} />
          <Stack.Screen name="project/[id]/index" options={{ title: 'Project' }} />
          <Stack.Screen name="project/[id]/chat" options={{ title: 'Ask FixKnit' }} />
          <Stack.Screen name="u/[handle]" options={{ title: '' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        </Stack.Protected>
      </Stack>
    </>
  )
}
