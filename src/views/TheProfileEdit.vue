<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProfile, type AvatarHistoryEntry } from '@/composables/useProfile'

const USERNAME_RE = /^[a-z0-9_]{3,20}$/
const BIO_MAX = 250

const router = useRouter()
const { getMyProfile, updateMyProfile, uploadAvatar, listAvatarHistory } = useProfile()

const username = ref('')
const bio = ref('')
const pendingAvatarUrl = ref<string | null>(null)
const history = ref<AvatarHistoryEntry[]>([])

const loading = ref(true)
const submitting = ref(false)
const uploading = ref(false)
const loadError = ref<string | null>(null)
const usernameTaken = ref(false)
const saveError = ref<string | null>(null)
const uploadError = ref<string | null>(null)

const usernameValid = computed(() => USERNAME_RE.test(username.value))
const bioValid = computed(() => bio.value.length <= BIO_MAX)
const canSave = computed(() => usernameValid.value && bioValid.value && !submitting.value)

async function load() {
  loading.value = true
  loadError.value = null
  const { data, error } = await getMyProfile()
  if (error || !data) {
    loadError.value = error?.message ?? 'Could not load profile'
    loading.value = false
    return
  }
  username.value = data.username
  bio.value = data.bio ?? ''
  pendingAvatarUrl.value = data.avatar_url
  await refreshHistory()
  loading.value = false
}

async function refreshHistory() {
  const { data } = await listAvatarHistory()
  history.value = data ?? []
}

async function onPickFile(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  uploading.value = true
  uploadError.value = null
  const { url, error } = await uploadAvatar(file)
  if (error || !url) {
    uploadError.value = error?.message ?? 'Upload failed'
  } else {
    pendingAvatarUrl.value = url
    await refreshHistory()
  }
  uploading.value = false
  input.value = ''
}

function selectHistoryAvatar(url: string) {
  if (uploading.value || submitting.value) return
  pendingAvatarUrl.value = url
}

async function onSave() {
  if (!canSave.value) return
  submitting.value = true
  usernameTaken.value = false
  saveError.value = null
  const { error } = await updateMyProfile({
    username: username.value,
    bio: bio.value,
    avatar_url: pendingAvatarUrl.value,
  })
  submitting.value = false
  if (error) {
    if ((error as any).code === '23505') {
      usernameTaken.value = true
    } else {
      saveError.value = error.message ?? 'Save failed'
    }
    return
  }
  router.push('/profile')
}

onMounted(load)
</script>

<template>
  <main class="profile-edit">
    <div v-if="loading">Loading…</div>
    <div v-else-if="loadError">{{ loadError }}</div>

    <form v-else class="profile-edit__form" @submit.prevent="onSave">
      <label class="profile-edit__field">
        <span>Username</span>
        <input
          v-model.trim="username"
          data-testid="profile-edit-username"
          :disabled="submitting"
          autocomplete="off"
        />
        <small v-if="!usernameValid" class="profile-edit__hint">
          Use a–z, 0–9, _, 3–20 chars.
        </small>
        <small
          v-if="usernameTaken"
          data-testid="profile-edit-username-error"
          class="profile-edit__error"
        >That username is taken.</small>
      </label>

      <label class="profile-edit__field">
        <span>Bio</span>
        <textarea
          v-model="bio"
          data-testid="profile-edit-bio"
          :disabled="submitting"
          rows="4"
        ></textarea>
        <small
          class="profile-edit__counter"
          :class="{ 'profile-edit__counter--over': !bioValid }"
        >{{ bio.length }} / {{ BIO_MAX }}</small>
      </label>

      <div class="profile-edit__avatar">
        <span class="profile-edit__field-label">Avatar</span>
        <img
          v-if="pendingAvatarUrl"
          :src="pendingAvatarUrl"
          alt="current avatar"
          class="profile-edit__avatar-preview"
        />
        <div v-else class="profile-edit__avatar-preview profile-edit__avatar-preview--empty"></div>

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          :disabled="uploading || submitting"
          data-testid="profile-edit-avatar-file"
          @change="onPickFile"
        />
        <small v-if="uploadError" class="profile-edit__error">{{ uploadError }}</small>

        <div v-if="history.length > 0" class="profile-edit__history">
          <button
            v-for="h in history.filter((x) => x.url !== pendingAvatarUrl)"
            :key="h.path"
            type="button"
            :disabled="uploading || submitting"
            class="profile-edit__history-item"
            @click="selectHistoryAvatar(h.url)"
          >
            <img :src="h.url" alt="past avatar" />
          </button>
        </div>
      </div>

      <div class="profile-edit__actions">
        <button
          type="button"
          :disabled="submitting"
          @click="router.push('/profile')"
        >Cancel</button>
        <button
          type="submit"
          data-testid="profile-edit-save"
          :disabled="!canSave"
          @click="onSave"
        >{{ submitting ? 'Saving…' : 'Save changes' }}</button>
      </div>

      <small v-if="saveError" class="profile-edit__error">{{ saveError }}</small>
    </form>
  </main>
</template>

<style lang="scss" scoped>
.profile-edit {
  max-width: 560px;
  margin: 0 auto;
  padding: 1.5rem 1rem;

  &__form { display: flex; flex-direction: column; gap: 1rem; }
  &__field, &__avatar { display: flex; flex-direction: column; gap: 0.35rem; }
  &__field-label { font-size: 0.9rem; color: lighten($color-iron-gray, 20%); }

  input, textarea {
    padding: 0.5rem 0.6rem;
    background: $color-shadow-gray-2;
    color: $color-text;
    border: 1px solid $color-iron-gray;
    border-radius: 4px;
    font-family: monospace;
  }

  &__hint    { color: lighten($color-iron-gray, 20%); }
  &__error   { color: #ff6b6b; }
  &__counter { align-self: flex-end; color: lighten($color-iron-gray, 20%); }
  &__counter--over { color: #ff6b6b; }

  &__avatar-preview {
    width: 200px;
    height: 200px;
    border-radius: 5px;
    object-fit: cover;
    background: $color-onyx;
  }
  &__avatar-preview--empty { background: $color-shadow-gray-2; }

  &__history { display: flex; gap: 0.5rem; }
  &__history-item {
    padding: 0;
    border: 1px solid $color-iron-gray;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;

    img {
      display: block;
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 3px;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
}
</style>
