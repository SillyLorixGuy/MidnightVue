// Vitest setup file — runs in every test worker before any test file is loaded.
// Node 25 ships a native `localStorage` (Web Storage API) that lacks `.clear()` and
// behaves differently from the browser/jsdom version Vitest's jsdom environment
// provides.  When jsdom is the configured environment, Vitest calls `populateGlobal`
// to copy jsdom globals into the worker, but `localStorage` is not in its hardcoded
// KEYS list, so Node 25's version survives.  We replace it here with a minimal
// in-memory implementation that is fully spec-compliant for test purposes.

import { beforeEach } from 'vitest'

class InMemoryStorage implements Storage {
  private store: Map<string, string> = new Map()

  get length(): number {
    return this.store.size
  }

  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value))
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }
}

// Install once per worker — replaces the Node 25 native getter.
const inMemoryLocalStorage = new InMemoryStorage()
const inMemorySessionStorage = new InMemoryStorage()

Object.defineProperty(globalThis, 'localStorage', {
  value: inMemoryLocalStorage,
  writable: true,
  configurable: true,
})

Object.defineProperty(globalThis, 'sessionStorage', {
  value: inMemorySessionStorage,
  writable: true,
  configurable: true,
})

// Clear storage between tests so state doesn't leak.
beforeEach(() => {
  inMemoryLocalStorage.clear()
  inMemorySessionStorage.clear()
})
