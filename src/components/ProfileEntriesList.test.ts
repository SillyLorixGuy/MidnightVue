import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

vi.mock('@/composables/useEntries', () => {
  const listMyEntries = vi.fn()
  return { useEntries: () => ({ listMyEntries }) }
})

// IntersectionObserver mock with manual trigger
let lastObserver: { trigger: () => void } | null = null
beforeEach(() => {
  lastObserver = null
  ;(globalThis as any).IntersectionObserver = class {
    cb: (entries: any[]) => void
    constructor(cb: (entries: any[]) => void) {
      this.cb = cb
      lastObserver = { trigger: () => cb([{ isIntersecting: true }]) }
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

import { useEntries } from '@/composables/useEntries'
import ProfileEntriesList from './ProfileEntriesList.vue'

const mockList = useEntries().listMyEntries as unknown as ReturnType<typeof vi.fn>

function entry(id: string) {
  return {
    id,
    user_id: 'u1',
    title: 'T',
    content: 'C',
    mood: null,
    share_code: id,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
  }
}

describe('ProfileEntriesList', () => {
  beforeEach(() => mockList.mockReset())

  it('shows skeletons on initial load and renders entries on resolve', async () => {
    mockList.mockResolvedValueOnce({ data: [entry('e1'), entry('e2')], error: null })
    const w = mount(ProfileEntriesList, { global: { stubs: { EntryCard: true } } })
    expect(w.findAll('[data-testid="profile-entry-skeleton"]').length).toBeGreaterThan(0)
    await flushPromises()
    expect(w.findAllComponents({ name: 'EntryCard' }).length).toBe(2)
  })

  it('fetches next page with correct offset when sentinel intersects', async () => {
    mockList.mockResolvedValueOnce({ data: Array.from({ length: 5 }, (_, i) => entry(`e${i}`)), error: null })
    const w = mount(ProfileEntriesList, { global: { stubs: { EntryCard: true } } })
    await flushPromises()

    mockList.mockResolvedValueOnce({ data: [entry('e6')], error: null })
    lastObserver!.trigger()
    await flushPromises()

    expect(mockList).toHaveBeenLastCalledWith({ limit: 5, offset: 5 })
  })

  it('stops fetching once a page returns fewer than 5 items (done state)', async () => {
    mockList.mockResolvedValueOnce({ data: [entry('e1'), entry('e2')], error: null })
    const w = mount(ProfileEntriesList, { global: { stubs: { EntryCard: true } } })
    await flushPromises()

    lastObserver!.trigger()
    await flushPromises()
    lastObserver!.trigger()
    await flushPromises()

    expect(mockList).toHaveBeenCalledTimes(1)
  })

  it('renders empty state when first page returns zero items', async () => {
    mockList.mockResolvedValueOnce({ data: [], error: null })
    const w = mount(ProfileEntriesList, { global: { stubs: { EntryCard: true } } })
    await flushPromises()
    expect(w.text()).toMatch(/no entries yet/i)
  })

  it('renders retry button on error', async () => {
    mockList.mockResolvedValueOnce({ data: null, error: new Error('boom') })
    const w = mount(ProfileEntriesList, { global: { stubs: { EntryCard: true } } })
    await flushPromises()
    expect(w.find('[data-testid="profile-entries-retry"]').exists()).toBe(true)
  })
})
