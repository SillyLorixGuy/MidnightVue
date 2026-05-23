import { supabase } from '@/lib/supabase'
import type { EntryWithAuthor } from './useEntries'

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export function useAnchors() {
  async function listAnchored() {
    const { data, error } = await supabase.rpc('get_my_anchored_entries')
    return { data: (data ?? []) as (EntryWithAuthor & { anchored_at: string })[], error }
  }

  async function addAnchor(entryId: string) {
    const uid = await currentUserId()
    if (!uid) return { error: new Error('Not authenticated') }
    return supabase.from('anchors').insert({ user_id: uid, entry_id: entryId })
  }

  async function removeAnchor(entryId: string) {
    const uid = await currentUserId()
    if (!uid) return { error: new Error('Not authenticated') }
    return supabase.from('anchors').delete().eq('user_id', uid).eq('entry_id', entryId)
  }

  async function isAnchored(entryId: string): Promise<boolean> {
    const uid = await currentUserId()
    if (!uid) return false
    const { data } = await supabase
      .from('anchors')
      .select('id')
      .eq('user_id', uid)
      .eq('entry_id', entryId)
      .maybeSingle()
    return !!data
  }

  return { listAnchored, addAnchor, removeAnchor, isAnchored }
}
