import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
    rpc: vi.fn(),
    storage: { from: vi.fn() },
    from: vi.fn(),
  },
}))

import { supabase } from '@/lib/supabase'

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'u1' } } })
  })

  it('getMyProfile returns the first row from the RPC', async () => {
    ;(supabase.rpc as any).mockResolvedValue({
      data: [{
        username: 'lorix',
        bio: 'hi',
        avatar_url: null,
        created_at: '2026-03-10T00:00:00Z',
        last_sign_in_at: '2026-04-07T00:00:00Z',
        total_entries: 49,
      }],
      error: null,
    })

    const { useProfile } = await import('./useProfile')
    const { data, error } = await useProfile().getMyProfile()

    expect(supabase.rpc).toHaveBeenCalledWith('get_my_profile')
    expect(error).toBeNull()
    expect(data?.username).toBe('lorix')
    expect(data?.total_entries).toBe(49)
  })

  it('getMyProfile surfaces RPC errors', async () => {
    ;(supabase.rpc as any).mockResolvedValue({ data: null, error: { message: 'boom' } })

    const { useProfile } = await import('./useProfile')
    const { data, error } = await useProfile().getMyProfile()

    expect(data).toBeNull()
    expect(error).toEqual({ message: 'boom' })
  })

  it('updateMyProfile passes p_ args to the RPC', async () => {
    ;(supabase.rpc as any).mockResolvedValue({ data: null, error: null })

    const { useProfile } = await import('./useProfile')
    await useProfile().updateMyProfile({
      username: 'lorix',
      bio: 'updated',
      avatar_url: 'https://x/avatar.png',
    })

    expect(supabase.rpc).toHaveBeenCalledWith('update_my_profile', {
      p_username: 'lorix',
      p_bio: 'updated',
      p_avatar_url: 'https://x/avatar.png',
    })
  })

  it('updateMyProfile preserves error.code for caller mapping', async () => {
    ;(supabase.rpc as any).mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate key' },
    })

    const { useProfile } = await import('./useProfile')
    const { error } = await useProfile().updateMyProfile({
      username: 'taken',
      bio: '',
      avatar_url: null,
    })

    expect(error?.code).toBe('23505')
  })
})
