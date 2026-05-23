import { ref, computed, readonly } from 'vue'
import type { Session, User, Provider } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const session = ref<Session | null>(null)
const user = ref<User | null>(null)
let initialized = false

function origin(): string {
  return typeof window !== 'undefined' ? window.location.origin : ''
}

function generateUsername(userId: string): string {
  // 6 lowercase alphanumeric chars derived from the user id
  const hash = userId.replace(/-/g, '').toLowerCase().slice(0, 6)
  return `user_${hash}`
}

async function ensureProfile(u: { id: string }, attempt = 0): Promise<void> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', u.id)
      .single()
    if (data) return
    const username = attempt === 0
      ? generateUsername(u.id)
      : `${generateUsername(u.id)}${attempt}`
    const { error } = await supabase.from('profiles').insert({ id: u.id, username })
    if (error && attempt < 5) {
      // Likely a username collision — retry with a suffix.
      return ensureProfile(u, attempt + 1)
    }
  } catch {
    // Silently swallow — profile bootstrap failure should never block auth flow.
  }
}

function applySession(s: Session | null) {
  session.value = s
  user.value = s?.user ?? null
  if (s?.user) {
    // Fire-and-forget; we don't block UI on profile bootstrap.
    void ensureProfile(s.user)
  }
}

export function useAuth() {
  if (!initialized) {
    initialized = true
    supabase.auth.getSession().then(({ data }) => applySession(data.session))
    supabase.auth.onAuthStateChange((_event, s) => applySession(s))
  }

  async function signUp(input: { email: string; password: string; username: string }) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
    })
    if (error || !data.user) return { error }
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, username: input.username })
    return { error: profileError }
  }

  async function signIn(input: { email: string; password: string }) {
    return supabase.auth.signInWithPassword(input)
  }

  async function signInWithOAuth(provider: Provider) {
    return supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${origin()}/journal` },
    })
  }

  async function signOut() {
    return supabase.auth.signOut()
  }

  async function requestPasswordReset(email: string) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin()}/reset-password`,
    })
  }

  async function setNewPassword(password: string) {
    return supabase.auth.updateUser({ password })
  }

  return {
    session: readonly(session),
    user: readonly(user),
    isAuthenticated: computed(() => !!session.value),
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    requestPasswordReset,
    setNewPassword,
    ensureProfile,
    // exposed for tests only
    _onAuthChange: (_event: string, s: Session | null) => applySession(s),
  }
}
