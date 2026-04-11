import * as SecureStore from 'expo-secure-store'
import type {
  MarketplaceAuthSession,
  MarketplaceAuthUser,
  MarketplaceConversation,
  MarketplaceJob,
  MarketplaceLoginInput,
  MarketplaceMessage,
  MarketplaceMessagePage,
  MarketplaceProfileUpdateInput,
  MarketplaceRegisterInput,
  MarketplaceRole,
} from '@/types/marketplace'

// ─── Config ──────────────────────────────────────────────────────────────────

export const API_URL = 'https://api.cleanifygo.com'
const SESSION_KEY = 'cleanifygo-session'

// ─── Session storage (SecureStore) ───────────────────────────────────────────

export async function getStoredSession(): Promise<MarketplaceAuthSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as MarketplaceAuthSession
  } catch {
    return null
  }
}

export async function saveSession(session: MarketplaceAuthSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session))
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function authHeaders(session: MarketplaceAuthSession) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.accessToken}`,
  }
}

function normalizeSession(raw: MarketplaceAuthSession): MarketplaceAuthSession {
  return {
    ...raw,
    accessToken: raw.accessToken || raw.token,
    refreshToken: raw.refreshToken || '',
    token: raw.accessToken || raw.token,
  }
}

async function refreshSession(session: MarketplaceAuthSession): Promise<MarketplaceAuthSession> {
  if (!session.refreshToken) throw new Error('No refresh token available.')

  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  })
  if (!res.ok) {
    await clearSession()
    throw new Error('Session expired. Please sign in again.')
  }
  const refreshed = normalizeSession((await res.json()) as MarketplaceAuthSession)
  await saveSession(refreshed)
  return refreshed
}

/**
 * Authenticated fetch with automatic token refresh on 401.
 * Returns the response and the (possibly refreshed) session.
 */
export async function apiFetch(
  session: MarketplaceAuthSession,
  endpoint: string,
  init: RequestInit = {},
  retried = false
): Promise<{ response: Response; session: MarketplaceAuthSession }> {
  const normalized = normalizeSession(session)
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...init,
    headers: { ...(init.headers ?? {}), ...authHeaders(normalized) },
  })

  if (response.status !== 401 || retried) {
    return { response, session: normalized }
  }

  let refreshed: MarketplaceAuthSession
  try {
    refreshed = await refreshSession(normalized)
  } catch (err) {
    throw err
  }

  const retryResponse = await fetch(`${API_URL}${endpoint}`, {
    ...init,
    headers: { ...(init.headers ?? {}), ...authHeaders(refreshed) },
  })

  return { response: retryResponse, session: refreshed }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(input: MarketplaceLoginInput): Promise<MarketplaceAuthSession> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: input.email, password: input.password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { message?: string }).message || 'Login failed.')
  }
  const session = normalizeSession((await res.json()) as MarketplaceAuthSession)
  await saveSession(session)
  return session
}

export async function register(input: MarketplaceRegisterInput): Promise<MarketplaceAuthSession> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { message?: string }).message || 'Registration failed.')
  }
  const session = normalizeSession((await res.json()) as MarketplaceAuthSession)
  await saveSession(session)
  return session
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export async function fetchJobs(
  session: MarketplaceAuthSession
): Promise<{ jobs: MarketplaceJob[]; session: MarketplaceAuthSession }> {
  const { response, session: s } = await apiFetch(session, '/api/jobs')
  if (!response.ok) throw new Error('Failed to load jobs.')
  const data = await response.json()
  return { jobs: (data.jobs ?? data) as MarketplaceJob[], session: s }
}

export async function claimJob(
  session: MarketplaceAuthSession,
  jobId: string
): Promise<{ job: MarketplaceJob; session: MarketplaceAuthSession }> {
  const { response, session: s } = await apiFetch(session, `/api/jobs/${jobId}/claim`, { method: 'POST' })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error((data as { message?: string }).message || 'Failed to claim job.')
  }
  return { job: (await response.json()) as MarketplaceJob, session: s }
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function fetchProfile(
  session: MarketplaceAuthSession
): Promise<{ user: MarketplaceAuthUser; session: MarketplaceAuthSession }> {
  const { response, session: s } = await apiFetch(session, '/api/profile')
  if (!response.ok) throw new Error('Failed to load profile.')
  return { user: (await response.json()) as MarketplaceAuthUser, session: s }
}

export async function updateProfile(
  session: MarketplaceAuthSession,
  input: MarketplaceProfileUpdateInput
): Promise<{ user: MarketplaceAuthUser; session: MarketplaceAuthSession }> {
  const { response, session: s } = await apiFetch(session, '/api/profile', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error((data as { message?: string }).message || 'Failed to update profile.')
  }
  return { user: (await response.json()) as MarketplaceAuthUser, session: s }
}

// ─── Conversations ────────────────────────────────────────────────────────────

export async function fetchConversations(
  session: MarketplaceAuthSession
): Promise<{ conversations: MarketplaceConversation[]; session: MarketplaceAuthSession }> {
  const { response, session: s } = await apiFetch(session, '/api/conversations')
  if (!response.ok) throw new Error('Failed to load conversations.')
  const data = await response.json()
  return { conversations: (data.conversations ?? data) as MarketplaceConversation[], session: s }
}

export async function fetchMessages(
  session: MarketplaceAuthSession,
  conversationId: string,
  cursor?: string
): Promise<{ page: MarketplaceMessagePage; session: MarketplaceAuthSession }> {
  const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
  const { response, session: s } = await apiFetch(session, `/api/conversations/${conversationId}/messages${qs}`)
  if (!response.ok) throw new Error('Failed to load messages.')
  return { page: (await response.json()) as MarketplaceMessagePage, session: s }
}

export async function sendMessage(
  session: MarketplaceAuthSession,
  conversationId: string,
  content: string
): Promise<{ message: MarketplaceMessage; session: MarketplaceAuthSession }> {
  const { response, session: s } = await apiFetch(session, `/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error((data as { message?: string }).message || 'Failed to send message.')
  }
  return { message: (await response.json()) as MarketplaceMessage, session: s }
}
