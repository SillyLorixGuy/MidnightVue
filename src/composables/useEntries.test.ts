import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
  },
}))

import { useEntries } from './useEntries'
import { supabase } from '@/lib/supabase'

describe('useEntries', () => {
  beforeEach(() => vi.clearAllMocks())

  it('createEntry inserts with the current user id', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 'e1' }, error: null })
    const insert = vi.fn().mockReturnValue({ select: () => ({ single }) })
    ;(supabase.from as any).mockReturnValue({ insert })

    const { createEntry } = useEntries()
    const { data, error } = await createEntry({ title: 'T', content: 'C', mood: 3 })

    expect(supabase.from).toHaveBeenCalledWith('entries')
    expect(insert).toHaveBeenCalledWith({ user_id: 'u1', title: 'T', content: 'C', mood: 3 })
    expect(data?.id).toBe('e1')
    expect(error).toBeNull()
  })

  it('listMyEntries fetches own entries newest first', async () => {
    const order = vi.fn().mockResolvedValue({ data: [{ id: 'e1' }], error: null })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as any).mockReturnValue({ select })

    const { listMyEntries } = useEntries()
    const { data } = await listMyEntries()

    expect(select).toHaveBeenCalledWith('*')
    expect(eq).toHaveBeenCalledWith('user_id', 'u1')
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(data?.length).toBe(1)
  })

  it('getByShareCode calls the rpc function', async () => {
    ;(supabase.rpc as any).mockResolvedValue({ data: [{ id: 'e2' }], error: null })
    const { getByShareCode } = useEntries()
    const { data } = await getByShareCode('00000000-0000-0000-0000-000000000000')
    expect(supabase.rpc).toHaveBeenCalledWith('get_entry_by_share_code', {
      code: '00000000-0000-0000-0000-000000000000',
    })
    expect(data?.id).toBe('e2')
  })

  it('countMyEntries returns the head-count for the current user', async () => {
    const eq = vi.fn().mockResolvedValue({ count: 7, error: null })
    const select = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as any).mockReturnValue({ select })

    const { countMyEntries } = useEntries()
    const n = await countMyEntries()

    expect(supabase.from).toHaveBeenCalledWith('entries')
    expect(select).toHaveBeenCalledWith('id', { count: 'exact', head: true })
    expect(eq).toHaveBeenCalledWith('user_id', 'u1')
    expect(n).toBe(7)
  })

  it('countMyEntries returns 0 when not authenticated', async () => {
    ;(supabase.auth.getUser as any).mockResolvedValueOnce({ data: { user: null } })
    const { countMyEntries } = useEntries()
    expect(await countMyEntries()).toBe(0)
  })

  it('listMyEntries applies limit and offset when provided', async () => {
    const range = vi.fn().mockResolvedValue({ data: [], error: null })
    const order = vi.fn().mockReturnValue({ range })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as any).mockReturnValue({ select })

    const { useEntries } = await import('./useEntries')
    await useEntries().listMyEntries({ limit: 5, offset: 10 })

    expect(range).toHaveBeenCalledWith(10, 14) // offset .. offset+limit-1 inclusive
  })

  it('listMyEntries defaults preserve prior behavior', async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as any).mockReturnValue({ select })

    const { useEntries } = await import('./useEntries')
    await useEntries().listMyEntries()

    expect(order).toHaveBeenCalled()
  })
})
