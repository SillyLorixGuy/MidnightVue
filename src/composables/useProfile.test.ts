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

  it('uploadAvatar rejects unsupported mime types', async () => {
    const file = new File([new Uint8Array(10)], 'a.gif', { type: 'image/gif' })
    const { useProfile } = await import('./useProfile')
    const { url, error } = await useProfile().uploadAvatar(file)
    expect(url).toBeNull()
    expect(error?.message).toMatch(/type/i)
  })

  it('uploadAvatar rejects files larger than 2 MB', async () => {
    const buf = new Uint8Array(2 * 1024 * 1024 + 1)
    const file = new File([buf], 'big.png', { type: 'image/png' })
    const { useProfile } = await import('./useProfile')
    const { url, error } = await useProfile().uploadAvatar(file)
    expect(url).toBeNull()
    expect(error?.message).toMatch(/size/i)
  })

  it('uploadAvatar uploads to avatars/<uid>/<ts>.<ext> and returns public URL', async () => {
    const upload = vi.fn().mockResolvedValue({ error: null })
    const list = vi.fn().mockResolvedValue({ data: [], error: null })
    const remove = vi.fn().mockResolvedValue({ error: null })
    const getPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://x/avatars/u1/1234.png' },
    })
    ;(supabase.storage.from as any).mockReturnValue({ upload, list, remove, getPublicUrl })

    const file = new File([new Uint8Array(10)], 'a.png', { type: 'image/png' })
    const { useProfile } = await import('./useProfile')
    const { url, error } = await useProfile().uploadAvatar(file)

    expect(error).toBeNull()
    expect(url).toBe('https://x/avatars/u1/1234.png')
    const [path, body] = upload.mock.calls[0]
    expect(path).toMatch(/^u1\/\d+\.png$/)
    expect(body).toBe(file)
  })

  it('uploadAvatar prunes when folder length exceeds 3', async () => {
    const upload = vi.fn().mockResolvedValue({ error: null })
    const list = vi.fn().mockResolvedValue({
      data: [
        { name: '1000.png' },
        { name: '2000.png' },
        { name: '3000.png' },
        { name: '4000.png' },
      ],
      error: null,
    })
    const remove = vi.fn().mockResolvedValue({ error: null })
    const getPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: 'u' } })
    ;(supabase.storage.from as any).mockReturnValue({ upload, list, remove, getPublicUrl })

    const file = new File([new Uint8Array(10)], 'a.png', { type: 'image/png' })
    const { useProfile } = await import('./useProfile')
    await useProfile().uploadAvatar(file)

    expect(remove).toHaveBeenCalledWith(['u1/1000.png'])
  })

  it('listAvatarHistory returns parsed entries sorted desc', async () => {
    const list = vi.fn().mockResolvedValue({
      data: [{ name: '3000.png' }, { name: '1000.png' }, { name: '2000.png' }],
      error: null,
    })
    const getPublicUrl = vi.fn((path: string) => ({
      data: { publicUrl: `https://x/${path}` },
    }))
    ;(supabase.storage.from as any).mockReturnValue({ list, getPublicUrl })

    const { useProfile } = await import('./useProfile')
    const { data, error } = await useProfile().listAvatarHistory()

    expect(error).toBeNull()
    expect(data?.map((d) => d.uploaded_at)).toEqual([3000, 2000, 1000])
    expect(data?.[0].path).toBe('u1/3000.png')
    expect(data?.[0].url).toBe('https://x/u1/3000.png')
  })
})
