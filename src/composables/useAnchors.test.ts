import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
  },
}))

import { useAnchors } from './useAnchors'
import { supabase } from '@/lib/supabase'

describe('useAnchors', () => {
  beforeEach(() => vi.clearAllMocks())

  it('listAnchored calls rpc', async () => {
    ;(supabase.rpc as any).mockResolvedValue({ data: [{ id: 'e1' }], error: null })
    const { listAnchored } = useAnchors()
    const { data } = await listAnchored()
    expect(supabase.rpc).toHaveBeenCalledWith('get_my_anchored_entries')
    expect(data?.length).toBe(1)
  })

  it('addAnchor inserts pair', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null })
    ;(supabase.from as any).mockReturnValue({ insert })
    const { addAnchor } = useAnchors()
    await addAnchor('e1')
    expect(supabase.from).toHaveBeenCalledWith('anchors')
    expect(insert).toHaveBeenCalledWith({ user_id: 'u1', entry_id: 'e1' })
  })

  it('removeAnchor deletes by composite key', async () => {
    const second = vi.fn().mockResolvedValue({ error: null })
    const first = vi.fn().mockReturnValue({ eq: second })
    const del = vi.fn().mockReturnValue({ eq: first })
    ;(supabase.from as any).mockReturnValue({ delete: del })

    const { removeAnchor } = useAnchors()
    await removeAnchor('e1')
    expect(del).toHaveBeenCalled()
    expect(first).toHaveBeenCalledWith('user_id', 'u1')
    expect(second).toHaveBeenCalledWith('entry_id', 'e1')
  })

  it('isAnchored returns true when row exists', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id: 'a1' }, error: null })
    const eq2 = vi.fn().mockReturnValue({ maybeSingle })
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 })
    const select = vi.fn().mockReturnValue({ eq: eq1 })
    ;(supabase.from as any).mockReturnValue({ select })

    const { isAnchored } = useAnchors()
    expect(await isAnchored('e1')).toBe(true)
  })
})
