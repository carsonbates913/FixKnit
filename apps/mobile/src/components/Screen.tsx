import type { ReactNode } from 'react'
import { RefreshControl, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'

import { useTheme } from '@/theme/ThemeProvider'

interface ScreenProps {
  children: ReactNode
  scroll?: boolean
  edges?: Edge[]
  contentStyle?: ViewStyle
  refreshing?: boolean
  onRefresh?: () => void
}

/** Page scaffold: themed background, safe areas, a 16–20px gutter and a phone-width column on web. */
export function Screen({ children, scroll = true, edges = ['top'], contentStyle, refreshing, onRefresh }: ScreenProps) {
  const { colors } = useTheme()
  const content = <View style={[styles.column, contentStyle]}>{children}</View>
  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: colors.bg }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  column: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 18, paddingVertical: 20, gap: 20, flexGrow: 1 },
})
