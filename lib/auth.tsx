import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { clearSession, getStoredSession, login as apiLogin, register as apiRegister } from '@/lib/api'
import type {
  MarketplaceAuthSession,
  MarketplaceLoginInput,
  MarketplaceRegisterInput,
} from '@/types/marketplace'

interface AuthContextValue {
  session: MarketplaceAuthSession | null
  loading: boolean
  signIn: (input: MarketplaceLoginInput) => Promise<void>
  signUp: (input: MarketplaceRegisterInput) => Promise<void>
  signOut: () => Promise<void>
  updateSession: (session: MarketplaceAuthSession) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<MarketplaceAuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStoredSession()
      .then(setSession)
      .finally(() => setLoading(false))
  }, [])

  const signIn = useCallback(async (input: MarketplaceLoginInput) => {
    const s = await apiLogin(input)
    setSession(s)
  }, [])

  const signUp = useCallback(async (input: MarketplaceRegisterInput) => {
    const s = await apiRegister(input)
    setSession(s)
  }, [])

  const signOut = useCallback(async () => {
    await clearSession()
    setSession(null)
  }, [])

  const updateSession = useCallback((s: MarketplaceAuthSession) => {
    setSession(s)
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signUp, signOut, updateSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
