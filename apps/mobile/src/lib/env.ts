import Constants from 'expo-constants'
import { Platform } from 'react-native'

/**
 * In development, reach the API and Supabase on the same machine that serves the app, so a phone
 * that scans the Expo QR code (or opens the LAN URL) needs no configuration.
 * In production, set EXPO_PUBLIC_API_URL and EXPO_PUBLIC_SUPABASE_URL.
 */
function devHost(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') return window.location.hostname
  return Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost'
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${devHost()}:8000`
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? `http://${devHost()}:54321`
// Supabase's local-development publishable key (public by design; RLS keeps the database closed).
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

/** Photo URLs from a local backend point at 127.0.0.1; rewrite them so a phone on the LAN can load them. */
export function mediaUrl(url: string): string {
  if (!__DEV__) return url
  return url.replace(/^http:\/\/(127\.0\.0\.1|localhost)(?=:)/, `http://${devHost()}`)
}
