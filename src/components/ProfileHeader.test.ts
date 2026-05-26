import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileHeader from './ProfileHeader.vue'
import type { ProfileData } from '@/composables/useProfile'

const fullProfile: ProfileData = {
  username: 'lorix',
  bio: 'Silly willy biography',
  avatar_url: 'https://x/avatar.png',
  created_at: '2026-03-10T00:00:00Z',
  last_sign_in_at: '2026-04-07T00:00:00Z',
  total_entries: 49,
}

describe('ProfileHeader', () => {
  it('renders username, bio and all three stats', () => {
    const w = mount(ProfileHeader, { props: { profile: fullProfile } })
    const text = w.text()
    expect(text).toContain('lorix')
    expect(text).toContain('Silly willy biography')
    expect(text).toContain('Mar 10 2026')
    expect(text).toContain('Apr 7 2026')
    expect(text).toContain('49')
  })

  it('renders default avatar when avatar_url is null', () => {
    const w = mount(ProfileHeader, {
      props: { profile: { ...fullProfile, avatar_url: null } },
    })
    const img = w.find('[data-testid="profile-avatar"]')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toMatch(/default/i)
  })

  it('omits the bio line when bio is null or empty', () => {
    const w = mount(ProfileHeader, {
      props: { profile: { ...fullProfile, bio: null } },
    })
    expect(w.find('[data-testid="profile-bio"]').exists()).toBe(false)
  })
})
