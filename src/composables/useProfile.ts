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

const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp'])
const MAX_SIZE = 2 * 1024 * 1024
const MAX_HISTORY = 3

const MIME_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
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

  async function uploadAvatar(file: File) {
    if (!ALLOWED_MIME.has(file.type)) {
      return { url: null, error: new Error(`Unsupported file type: ${file.type}`) }
    }
    if (file.size > MAX_SIZE) {
      return { url: null, error: new Error('File size exceeds 2 MB') }
    }
    const uid = await currentUserId()
    if (!uid) return { url: null, error: new Error('Not authenticated') }

    const ext = MIME_EXT[file.type]
    const path = `${uid}/${Date.now()}.${ext}`
    const bucket = supabase.storage.from('avatars')

    const { error: uploadErr } = await bucket.upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (uploadErr) return { url: null, error: uploadErr }

    const { data: listed, error: listErr } = await bucket.list(uid, {
      sortBy: { column: 'name', order: 'asc' },
    })
    // Prune is fail-open: upload already succeeded, so we return success even if cleanup fails. Leaked files are pruned on the next upload.
    if (!listErr && listed && listed.length > MAX_HISTORY) {
      const toDrop = listed
        .slice(0, listed.length - MAX_HISTORY)
        .map((f) => `${uid}/${f.name}`)
      await bucket.remove(toDrop)
    }

    const { data: pub } = bucket.getPublicUrl(path)
    return { url: pub.publicUrl, error: null }
  }

  async function listAvatarHistory() {
    const uid = await currentUserId()
    if (!uid) return { data: null, error: new Error('Not authenticated') }
    const bucket = supabase.storage.from('avatars')
    const { data, error } = await bucket.list(uid, {
      sortBy: { column: 'name', order: 'desc' },
    })
    if (error) return { data: null, error }
    const entries: AvatarHistoryEntry[] = (data ?? [])
      .map((f) => {
        const path = `${uid}/${f.name}`
        const ts = parseInt(f.name.split('.')[0], 10) || 0
        return {
          url: bucket.getPublicUrl(path).data.publicUrl,
          path,
          uploaded_at: ts,
        }
      })
      .sort((a, b) => b.uploaded_at - a.uploaded_at)
    return { data: entries, error: null }
  }

  return { getMyProfile, updateMyProfile, uploadAvatar, listAvatarHistory }
}
