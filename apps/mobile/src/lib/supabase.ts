import 'react-native-url-polyfill/auto'
import './localStorage'

import { createClient } from '@supabase/supabase-js'
import { AppState, Platform } from 'react-native'

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './env'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Refresh tokens only while the app is in the foreground (browsers handle this themselves).
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh()
    else supabase.auth.stopAutoRefresh()
  })
}
