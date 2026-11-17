import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import { ArrowUp } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View, type ScrollViewInstance } from 'react-native'
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

import { useAskAssistant, useProject, useProjectMessages } from '@/api/hooks'
import type { ChatMessageOut } from '@/api/schema'
import { Chip } from '@/components/Chip'
import { Appear, FadeInView, PressScale } from '@/components/Motion'
import { Notice } from '@/components/Notice'
import { Skeleton } from '@/components/Skeleton'
import { Text } from '@/components/Text'
import { useTheme } from '@/theme/ThemeProvider'
import { fonts, radius } from '@/theme/tokens'

const yarn = require('../../../../assets/green-yarn.webp')

const SUGGESTIONS = [
  'I don’t have matching yarn. What can I use?',
  'How do I keep the edges from puckering?',
  'How should I finish off the ends?',
  'Does my latest photo look right?',
]

export default function AssistantChat() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const project = useProject(id)
  const messages = useProjectMessages(id)
  const ask = useAskAssistant(id)
  const [draft, setDraft] = useState('')
  const scroller = useRef<ScrollViewInstance>(null)

  const pending = ask.isPending ? ask.variables : null
  const canSend = draft.trim().length > 0 && !ask.isPending

  function send(text = draft) {
    const body = text.trim()
    if (!body || ask.isPending) return
    setDraft('')
    ask.mutate(body, { onError: () => setDraft(body) })
  }

  const count = (messages.data?.length ?? 0) + (pending ? 2 : 0)
  useEffect(() => {
    requestAnimationFrame(() => scroller.current?.scrollToEnd({ animated: true }))
  }, [count])

  return (
    <SafeAreaView edges={['bottom']} style={[styles.root, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 44}
      >
        <ScrollView ref={scroller} style={styles.root} contentContainerStyle={styles.thread} keyboardShouldPersistTaps="handled">
          <Appear style={styles.intro}>
            <Image source={yarn} style={styles.introYarn} contentFit="contain" />
            <Text variant="h2" center>
              {project.data ? `Ask about your ${project.data.plan.title.toLowerCase()}` : 'Ask the repair assistant'}
            </Text>
            <Text variant="small" tone="muted" center>
              I can see your photos, your plan and which steps you’ve done.
            </Text>
          </Appear>

          {messages.isPending ? (
            <ThreadSkeleton />
          ) : messages.isError ? (
            <Notice title="Couldn’t load the conversation">{messages.error.message}</Notice>
          ) : (
            <>
              {messages.data.map((m, i) => (
                <Bubble key={m.id} message={m} index={Math.max(0, i - messages.data.length + 4)} />
              ))}
              {messages.data.length === 0 && !pending && (
                <Appear index={1} style={styles.suggestions}>
                  {SUGGESTIONS.map((s) => (
                    <Chip key={s} label={s} selected={false} onPress={() => send(s)} />
                  ))}
                </Appear>
              )}
            </>
          )}

          {pending && (
            <>
              <Bubble message={{ id: 'pending', role: 'user', body: pending, created_at: '' }} />
              <TypingBubble />
            </>
          )}
          {ask.isError && (
            <FadeInView>
              <Notice title="The assistant didn’t answer">{ask.error.message}</Notice>
            </FadeInView>
          )}
        </ScrollView>

        <View style={[styles.composer, { borderTopColor: colors.line, backgroundColor: colors.bg }]}>
          <View style={[styles.inputWrap, { borderColor: colors.lineStrong, backgroundColor: colors.surface }]}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Ask a question…"
              placeholderTextColor={colors.muted}
              multiline
              // A web textarea defaults to two rows; start at one like the native field.
              {...(Platform.OS === 'web' ? { rows: 1 } : {})}
              maxLength={2000}
              accessibilityLabel="Your question"
              style={[styles.input, { color: colors.fg }]}
              onKeyPress={(e) => {
                // Enter sends on web; Shift+Enter keeps the newline.
                const key = e.nativeEvent as { key: string; shiftKey?: boolean }
                if (Platform.OS === 'web' && key.key === 'Enter' && !key.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
            />
            <PressScale
              accessibilityRole="button"
              accessibilityLabel="Send"
              disabled={!canSend}
              haptic
              scaleTo={0.9}
              onPress={() => send()}
              style={[styles.send, { backgroundColor: canSend ? colors.primary : colors.surface2 }]}
            >
              <ArrowUp size={18} strokeWidth={2.5} color={canSend ? colors.onPrimary : colors.muted} />
            </PressScale>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function Bubble({ message, index = 0 }: { message: ChatMessageOut; index?: number }) {
  const { colors } = useTheme()
  const mine = message.role === 'user'
  return (
    <Appear index={index} style={[styles.row, mine && styles.rowMine]}>
      {!mine && <Image source={yarn} style={styles.avatar} contentFit="contain" />}
      <View
        style={[
          styles.bubble,
          mine
            ? { backgroundColor: colors.primary, borderBottomRightRadius: radius.sm }
            : { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderBottomLeftRadius: radius.sm },
        ]}
      >
        <Text variant="body" tone={mine ? 'onPrimary' : 'fg'} selectable>
          {message.body}
        </Text>
      </View>
    </Appear>
  )
}

/** Three dots that bob in turn while the assistant thinks. */
function TypingBubble() {
  const { colors } = useTheme()
  return (
    <FadeInView style={styles.row}>
      <Image source={yarn} style={styles.avatar} contentFit="contain" />
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="The assistant is typing"
        style={[styles.bubble, styles.typing, { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderBottomLeftRadius: radius.sm }]}
      >
        {[0, 1, 2].map((i) => (
          <Dot key={i} delay={i * 150} color={colors.muted} />
        ))}
      </View>
    </FadeInView>
  )
}

function Dot({ delay, color }: { delay: number; color: string }) {
  const lift = useSharedValue(0)
  useEffect(() => {
    lift.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 300 }), withTiming(0, { duration: 300 }), withTiming(0, { duration: 300 })), -1, false, undefined, ReduceMotion.System),
    )
  }, [delay, lift])
  const animated = useAnimatedStyle(() => ({ opacity: 0.4 + lift.value * 0.6, transform: [{ translateY: -lift.value * 3 }] }))
  return <Animated.View style={[styles.dot, { backgroundColor: color }, animated]} />
}

function ThreadSkeleton() {
  return (
    <View style={{ gap: 14 }} accessibilityRole="progressbar" accessibilityLabel="Loading the conversation">
      <View style={[styles.row, styles.rowMine]}>
        <Skeleton width="60%" height={44} round={radius.lg} />
      </View>
      <View style={styles.row}>
        <Skeleton width={28} height={28} round={14} />
        <Skeleton width="75%" height={88} round={radius.lg} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 0 },
  thread: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 20, gap: 14, flexGrow: 1 },
  intro: { alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingBottom: 8 },
  introYarn: { width: 56, height: 56, marginBottom: 4 },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  rowMine: { justifyContent: 'flex-end' },
  avatar: { width: 28, height: 28 },
  bubble: { maxWidth: '82%', borderRadius: radius.lg + 6, paddingHorizontal: 14, paddingVertical: 10 },
  typing: { flexDirection: 'row', gap: 5, paddingVertical: 15 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  composer: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, paddingVertical: 10 },
  inputWrap: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
  },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 16, lineHeight: 22, maxHeight: 120, paddingVertical: 6, outlineStyle: 'none' } as never,
  send: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
})
