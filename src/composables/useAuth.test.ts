import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

vi.mock('@/lib/supabase', () => {
  const listeners: Array<(event: string, session: any) => void> = []
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn((cb: any) => {
          listeners.push(cb)
          return { data: { subscription: { unsubscribe: vi.fn() } } }
        }),
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signInWithOAuth: vi.fn(),
        signOut: vi.fn(),
        resetPasswordForEmail: vi.fn(),
        updateUser: vi.fn(),
      },
      from: vi.fn(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      })),
    },
    __emit: (event: string, session: any) => listeners.forEach((l) => l(event, session)),
  }
})

import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase'

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('signUp creates auth user then inserts profile row', async () => {
    ;(supabase.auth.signUp as any).mockResolvedValue({
      data: { user: { id: 'u1' }, session: null },
      error: null,
    })
    const insert = vi.fn().mockResolvedValue({ error: null })
    ;(supabase.from as any).mockReturnValue({ insert })

    const { signUp } = useAuth()
    const result = await signUp({ email: 'a@b.c', password: 'pw', username: 'alice_01' })

    expect(supabase.auth.signUp).toHaveBeenCalledWith({ email: 'a@b.c', password: 'pw' })
    expect(supabase.from).toHaveBeenCalledWith('profiles')
    expect(insert).toHaveBeenCalledWith({ id: 'u1', username: 'alice_01' })
    expect(result.error).toBeNull()
  })

  it('signIn delegates to signInWithPassword', async () => {
    ;(supabase.auth.signInWithPassword as any).mockResolvedValue({ error: null })
    const { signIn } = useAuth()
    await signIn({ email: 'a@b.c', password: 'pw' })
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.c', password: 'pw' })
  })

  it('signInWithOAuth passes provider and redirectTo', async () => {
    ;(supabase.auth.signInWithOAuth as any).mockResolvedValue({ error: null })
    const { signInWithOAuth } = useAuth()
    await signInWithOAuth('google')
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: expect.stringContaining('/journal') },
    })
  })

  it('requestPasswordReset sends recovery email with reset redirect', async () => {
    ;(supabase.auth.resetPasswordForEmail as any).mockResolvedValue({ error: null })
    const { requestPasswordReset } = useAuth()
    await requestPasswordReset('a@b.c')
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'a@b.c',
      { redirectTo: expect.stringContaining('/reset-password') }
    )
  })

  it('setNewPassword delegates to updateUser', async () => {
    ;(supabase.auth.updateUser as any).mockResolvedValue({ error: null })
    const { setNewPassword } = useAuth()
    await setNewPassword('newpw')
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newpw' })
  })

  it('isAuthenticated reflects session presence', async () => {
    const { isAuthenticated, _onAuthChange } = useAuth() as any
    expect(isAuthenticated.value).toBe(false)
    _onAuthChange('SIGNED_IN', { user: { id: 'u1' } })
    expect(isAuthenticated.value).toBe(true)
    _onAuthChange('SIGNED_OUT', null)
    expect(isAuthenticated.value).toBe(false)
  })
})
