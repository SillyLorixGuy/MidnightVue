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

export function write(queue: PendingEntry[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(queue))
  } catch {
    // quota exceeded / storage disabled — drop silently; DB path is the source of truth
  }
}

export function add(entry: PendingEntry): void {
  const next = read()
  next.push(entry)
  write(next)
}

export function remove(id: string): void {
  write(read().filter((e) => e.id !== id))
}

export function count(): number {
  return read().length
}
