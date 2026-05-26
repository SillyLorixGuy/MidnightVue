import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const updateMyProfile = vi.fn()
const getMyProfile = vi.fn()
const uploadAvatar = vi.fn()
const listAvatarHistory = vi.fn()

vi.mock('@/composables/useProfile', () => ({
  useProfile: () => ({ getMyProfile, updateMyProfile, uploadAvatar, listAvatarHistory }),
}))

const routerPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPush, back: vi.fn() }),
  RouterLink: { template: '<a><slot/></a>' },
}))

import TheProfileEdit from './TheProfileEdit.vue'

const baseProfile = {
  username: 'lorix',
  bio: 'hi',
  avatar_url: null,
  created_at: '2026-03-10T00:00:00Z',
  last_sign_in_at: '2026-04-07T00:00:00Z',
  total_entries: 0,
}

beforeEach(() => {
  vi.clearAllMocks()
  getMyProfile.mockResolvedValue({ data: baseProfile, error: null })
  listAvatarHistory.mockResolvedValue({ data: [], error: null })
  updateMyProfile.mockResolvedValue({ error: null })
})

describe('TheProfileEdit', () => {
  it('disables Save when username does not match pattern', async () => {
    const w = mount(TheProfileEdit)
    await flushPromises()
    await w.find('[data-testid="profile-edit-username"]').setValue('AB')
    expect(w.find('[data-testid="profile-edit-save"]').attributes('disabled')).toBeDefined()
  })

  it('disables Save when bio exceeds 250 chars', async () => {
    const w = mount(TheProfileEdit)
    await flushPromises()
    await w.find('[data-testid="profile-edit-bio"]').setValue('x'.repeat(251))
    expect(w.find('[data-testid="profile-edit-save"]').attributes('disabled')).toBeDefined()
  })

  it('submits valid form via updateMyProfile and routes to /profile', async () => {
    const w = mount(TheProfileEdit)
    await flushPromises()
    await w.find('[data-testid="profile-edit-username"]').setValue('newname')
    await w.find('[data-testid="profile-edit-bio"]').setValue('shiny new bio')
    await w.find('[data-testid="profile-edit-save"]').trigger('click')
    await flushPromises()
    expect(updateMyProfile).toHaveBeenCalledWith({
      username: 'newname',
      bio: 'shiny new bio',
      avatar_url: null,
    })
    expect(routerPush).toHaveBeenCalledWith('/profile')
  })

  it('surfaces username-taken error on code 23505', async () => {
    updateMyProfile.mockResolvedValueOnce({ error: { code: '23505', message: 'dup' } })
    const w = mount(TheProfileEdit)
    await flushPromises()
    await w.find('[data-testid="profile-edit-username"]').setValue('taken')
    await w.find('[data-testid="profile-edit-save"]').trigger('click')
    await flushPromises()
    expect(w.find('[data-testid="profile-edit-username-error"]').text()).toMatch(/taken/i)
    expect(routerPush).not.toHaveBeenCalled()
  })
})
