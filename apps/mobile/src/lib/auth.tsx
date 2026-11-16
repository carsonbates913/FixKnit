import type { Session } from '@supabase/supabase-js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import { api, unwrap } from '@/api/client'
import type { Me } from '@/api/schema'

import { supabase } from './supabase'

interface AuthValue {
  session: Session | null
  /** True until the stored session (if any) has been restored. */
  restoring: boolean
  me: Me | undefined
  meLoading: boolean
  continueAsGuest: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(null)
  const [restoring, setRestoring] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setRestoring(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id
  const me = useQuery({
    queryKey: ['me', userId],
    queryFn: () => unwrap(api.GET('/api/me')),
    enabled: Boolean(userId),
    staleTime: 60_000,
  })

  const value: AuthValue = {
    session,
    restoring,
    me: me.data,
    meLoading: Boolean(userId) && me.isPending,
    continueAsGuest: async () => {
      const { error } = await supabase.auth.signInAnonymously()
      if (error) throw new Error(error.message)
    },
    signOut: async () => {
      await supabase.auth.signOut()
      queryClient.clear()
    },
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
