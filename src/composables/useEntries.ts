import { supabase } from '@/lib/supabase'

export interface EntryRow {
  id: string
  user_id: string
  title: string
  content: string
  mood: number | null
  share_code: string
  created_at: string
}

export interface EntryWithAuthor extends EntryRow {
  author_username: string
  author_avatar_url: string | null
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export function useEntries() {
  async function createEntry(input: { title: string; content: string; mood: number | null }) {
    const uid = await currentUserId()
    if (!uid) return { data: null, error: new Error('Not authenticated') }
    const { data, error } = await supabase
      .from('entries')
      .insert({ user_id: uid, title: input.title, content: input.content, mood: input.mood })
      .select()
      .single()
    return { data: data as EntryRow | null, error }
  }

  async function listMyEntries() {
    const uid = await currentUserId()
    if (!uid) return { data: null, error: new Error('Not authenticated') }
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    return { data: (data ?? []) as EntryRow[], error }
  }

  async function getByShareCode(code: string) {
    const { data, error } = await supabase.rpc('get_entry_by_share_code', { code })
    if (error) return { data: null, error }
    const row = Array.isArray(data) ? data[0] : data
    return { data: (row ?? null) as EntryWithAuthor | null, error: null }
  }

  async function countMyEntries(): Promise<number> {
    const uid = await currentUserId()
    if (!uid) return 0
    const { count } = await supabase
      .from('entries')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', uid)
    return count ?? 0
  }

  return { createEntry, listMyEntries, getByShareCode, countMyEntries }
}
