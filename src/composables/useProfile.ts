import { supabase } from '@/lib/supabase'

export interface ProfileData {
  username: string
  bio: string | null
  avatar_url: string | null
  created_at: string
  last_sign_in_at: string
  total_entries: number
}

export interface AvatarHistoryEntry {
  url: string
  path: string
  uploaded_at: number
}

export interface UpdateProfileInput {
  username: string
  bio: string
  avatar_url: string | null
}

export function useProfile() {
  async function getMyProfile() {
    const { data, error } = await supabase.rpc('get_my_profile')
    if (error) return { data: null, error }
    const row = Array.isArray(data) ? data[0] : data
    return { data: (row ?? null) as ProfileData | null, error: null }
  }

  async function updateMyProfile(input: UpdateProfileInput) {
    const { error } = await supabase.rpc('update_my_profile', {
      p_username: input.username,
      p_bio: input.bio,
      p_avatar_url: input.avatar_url,
    })
    return { error }
  }

  return { getMyProfile, updateMyProfile }
}
