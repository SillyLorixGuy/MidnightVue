import { describe, it, expect, beforeEach, vi } from 'vitest'
import { read, write, add, remove, count, KEY } from './pendingEntries'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('pendingEntries', () => {
  it('read() returns [] when the key is missing', () => {
    expect(read()).toEqual([])
  })

  it('read() returns [] when stored JSON is malformed (does not throw)', () => {
    localStorage.setItem(KEY, '{not json')
    expect(read()).toEqual([])
  })

  it('write() persists the queue to localStorage as JSON', () => {
    write([
      { id: 'a', title: 'T', content: 'C', mood: 50, drafted_at_iso: '2026-05-25T00:00:00.000Z' },
    ])
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual([
      { id: 'a', title: 'T', content: 'C', mood: 50, drafted_at_iso: '2026-05-25T00:00:00.000Z' },
    ])
  })

  it('add() appends to the existing queue', () => {
    write([{ id: 'a', title: 'A', content: 'a', mood: null, drafted_at_iso: 'x' }])
    add({ id: 'b', title: 'B', content: 'b', mood: 30, drafted_at_iso: 'y' })
    expect(read().map((e) => e.id)).toEqual(['a', 'b'])
  })

  it('remove() drops the entry with the matching id', () => {
    write([
      { id: 'a', title: 'A', content: 'a', mood: null, drafted_at_iso: 'x' },
      { id: 'b', title: 'B', content: 'b', mood: null, drafted_at_iso: 'y' },
    ])
    remove('a')
    expect(read().map((e) => e.id)).toEqual(['b'])
  })

  it('count() returns the queue length', () => {
    expect(count()).toBe(0)
    write([
      { id: 'a', title: 'A', content: 'a', mood: null, drafted_at_iso: 'x' },
      { id: 'b', title: 'B', content: 'b', mood: null, drafted_at_iso: 'y' },
    ])
    expect(count()).toBe(2)
  })

  it('write() swallows quota errors so callers never crash', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })
    expect(() => write([{ id: 'a', title: 'A', content: 'a', mood: null, drafted_at_iso: 'x' }]))
      .not.toThrow()
    spy.mockRestore()
  })
})
