import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EntryCard from './EntryCard.vue'

const entry = {
  id: 'e1',
  title: 'Test Title',
  content: 'Some body content.',
  created_at: '2026-02-27T01:00:00Z',
  share_code: 'caa190ac-82c4-47c1-881e-193cca4ac345',
  author: { username: 'alice', avatar_url: null },
}

describe('EntryCard', () => {
  it('renders title, username, and content', () => {
    const wrapper = mount(EntryCard, { props: { entry, isAnchored: false } })
    expect(wrapper.text()).toContain('Test Title')
    expect(wrapper.text()).toContain('alice')
    expect(wrapper.text()).toContain('Some body content.')
    expect(wrapper.text()).toContain('caa190ac-82c4-47c1-881e-193cca4ac345')
  })

  it('emits toggle-anchor when bookmark clicked', async () => {
    const wrapper = mount(EntryCard, { props: { entry, isAnchored: false } })
    await wrapper.get('[data-testid="anchor-toggle"]').trigger('click')
    expect(wrapper.emitted('toggle-anchor')?.[0]).toEqual(['e1'])
  })

  it('toggles share-code reveal when eye clicked', async () => {
    const wrapper = mount(EntryCard, { props: { entry, isAnchored: false } })
    expect(wrapper.get('[data-testid="share-code"]').classes()).toContain('is-blurred')
    await wrapper.get('[data-testid="reveal-toggle"]').trigger('click')
    expect(wrapper.get('[data-testid="share-code"]').classes()).not.toContain('is-blurred')
  })
})
