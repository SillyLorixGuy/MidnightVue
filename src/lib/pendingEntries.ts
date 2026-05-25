export const KEY = 'mv:pending-entries'

export interface PendingEntry {
  id: string
  title: string
  content: string
  mood: number | null
  drafted_at_iso: string
}

export function read(): PendingEntry[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as PendingEntry[]) : []
  } catch {
    return []
  }
}

export function write(queue: PendingEntry[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(queue))
    return true
  } catch {
    return false
  }
}

export function add(entry: PendingEntry): boolean {
  const next = read()
  next.push(entry)
  return write(next)
}

export function remove(id: string): boolean {
  return write(read().filter((e) => e.id !== id))
}

export function count(): number {
  return read().length
}
