import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import type { AppUser } from './supabase'

type AuthContextType = {
  user: AppUser | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => ({ success: false }),
  logout: async () => {},
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user from Supabase Auth session on mount
  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data } = await supabase
          .from('app_users')
          .select('*')
          .eq('auth_id', session.user.id)
          .eq('is_active', true)
          .maybeSingle()
        if (data) {
          setUser(data)
        } else {
          await supabase.auth.signOut()
        }
      }
      setLoading(false)
    }
    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null)
      } else if (session?.user) {
        const { data } = await supabase
          .from('app_users')
          .select('*')
          .eq('auth_id', session.user.id)
          .eq('is_active', true)
          .maybeSingle()
        if (data) setUser(data)
      }
    })

    return () => { subscription.unsubscribe() }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    // Step 1: Verify credentials via RPC (works for anon, bypasses RLS)
    const { data: appUser, error: rpcError } = await supabase
      .rpc('authenticate_user', { email_input: email, password_input: password })

    if (rpcError || !appUser || appUser.length === 0) {
      return { success: false, error: 'Email atau password salah' }
    }

    const found = appUser[0]

    // Step 2: Ensure auth user exists in Supabase Auth
    let authUser = null
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password,
    })

    if (signInError && signInError.message.toLowerCase().includes('invalid')) {
      // Auth user doesn't exist, create it
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: password,
        options: { data: { name: found.name } },
      })
      if (signUpError) {
        return { success: false, error: 'Gagal membuat sesi autentikasi' }
      }
      authUser = signUpData?.user
      if (authUser) {
        // Link app_user to auth user
        await supabase.from('app_users').update({ auth_id: authUser.id }).eq('id', found.id)
        // Sign in after signup
        const { data: signInAfter } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password: password,
        })
        if (signInAfter?.user) {
          authUser = signInAfter.user
        }
      }
    } else {
      authUser = signInData?.user
      if (authUser && !found.auth_id) {
        await supabase.from('app_users').update({ auth_id: authUser.id }).eq('id', found.id)
      }
    }

    if (!authUser) {
      return { success: false, error: 'Gagal membuat sesi autentikasi' }
    }

    // Step 3: Load user with updated auth_id
    const { data: refreshed } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', found.id)
      .maybeSingle()

    if (refreshed) {
      setUser(refreshed)
    } else {
      setUser(found)
    }

    return { success: true }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
