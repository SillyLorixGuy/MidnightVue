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
  <section class="profile-edit">
    <div v-if="loading" class="profile-edit__pending">~/loading…</div>
    <div v-else-if="loadError" class="profile-edit__pending">! {{ loadError }}</div>

    <form v-else class="profile-edit__form" @submit.prevent="onSave">
      <header class="profile-edit__head">
        <h1 class="profile-edit__title">edit profile</h1>
      </header>

      <section class="profile-edit__group">
        <label class="profile-edit__field">
          <span class="profile-edit__label">› username</span>
          <input
            v-model.trim="username"
            data-testid="profile-edit-username"
            :disabled="submitting"
            autocomplete="off"
            class="profile-edit__input"
          />
          <small
            v-if="usernameTaken"
            data-testid="profile-edit-username-error"
            class="profile-edit__error"
          >[ that username is taken ]</small>
        </label>

        <label class="profile-edit__field">
          <span class="profile-edit__label">› bio</span>
          <textarea
            v-model="bio"
            data-testid="profile-edit-bio"
            :disabled="submitting"
            rows="4"
            class="profile-edit__input profile-edit__input--multi"
          ></textarea>
          <small
            class="profile-edit__counter"
            :class="{ 'profile-edit__counter--over': !bioValid }"
          >[ {{ bio.length }} / {{ BIO_MAX }} ]</small>
        </label>
      </section>

      <section class="profile-edit__group">
        <span class="profile-edit__label">› avatar</span>
        <div class="profile-edit__avatar">
          <div class="profile-edit__slot profile-edit__slot--current">
            <img
              v-if="pendingAvatarUrl"
              :src="pendingAvatarUrl"
              alt="current avatar"
              class="profile-edit__slot-img"
            />
            <div v-else class="profile-edit__slot-img profile-edit__slot-img--empty">— empty —</div>
            <span class="profile-edit__slot-tag">[0] current</span>
          </div>

          <div
            v-if="history.filter((x) => x.url !== pendingAvatarUrl).length > 0"
            class="profile-edit__history"
          >
            <button
              v-for="(h, i) in history.filter((x) => x.url !== pendingAvatarUrl)"
              :key="h.path"
              type="button"
              :disabled="uploading || submitting"
              class="profile-edit__slot profile-edit__slot--past"
              @click="selectHistoryAvatar(h.url)"
            >
              <img :src="h.url" alt="past avatar" class="profile-edit__slot-img" />
              <span class="profile-edit__slot-tag">[{{ i + 1 }}] past</span>
            </button>
          </div>
        </div>

        <label class="profile-edit__upload">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            :disabled="uploading || submitting"
            data-testid="profile-edit-avatar-file"
            @change="onPickFile"
            class="profile-edit__upload-input"
          />
          <span class="profile-edit__upload-cta">
            {{ uploading ? 'uploading…' : '+ upload new · png | jpg | webp · ≤2MB' }}
          </span>
        </label>
        <small v-if="uploadError" class="profile-edit__error">[ {{ uploadError }} ]</small>
      </section>

      <footer class="profile-edit__actions">
        <button
          type="button"
          :disabled="submitting"
          class="profile-edit__btn profile-edit__btn--ghost"
          @click="router.push('/profile')"
        >cancel</button>
        <button
          type="submit"
          data-testid="profile-edit-save"
          :disabled="!canSave"
          class="profile-edit__btn profile-edit__btn--commit"
          @click="onSave"
        >{{ submitting ? 'saving…' : '› save changes' }}</button>
      </footer>

      <small v-if="saveError" class="profile-edit__error">[ {{ saveError }} ]</small>
    </form>
  </section>
</template>

<style lang="scss" scoped>
.profile-edit {
  max-width: 90%;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
  font-family: $ibmpm;
  color: $color-text;

  &__pending {
    padding: 2rem 0;
    font-family: $ibmpm;
    color: $color-text;
    opacity: 0.7;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  // ── Header ──────────────────────────────────────
  &__head {
    display: flex;
    align-items: baseline;
    gap: 0.65rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px dashed $color-iron-gray;
  }
  &__prompt {
    font-family: $ibmpm;
    font-size: $fs-small;
    color: $color-text;
    opacity: 0.55;
  }
  &__title {
    margin: 0;
    font-family: $oxanium;
    font-size: $fs-h1;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: $color-text;
    text-shadow: $glow-25-white;
  }

  // ── Groups ──────────────────────────────────────
  &__group {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  &__label {
    font-family: $ibmpm;
    font-size: $fs-small;
    color: $color-text;
    opacity: 0.85;
  }

  // ── Inputs ──────────────────────────────────────
  &__input {
    width: 100%;
    padding: 0.6rem 0.75rem;
    background: $color-onyx;
    color: $color-text;
    border: 1px solid $color-iron-gray;
    border-radius: 4px;
    font-family: $ibmpm;
    font-size: $fs-small;
    transition: border-color 180ms ease, box-shadow 180ms ease;

    &:focus {
      outline: none;
      border-color: $color-text;
      box-shadow: $glow-25-gray;
    }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
  &__input--multi {
    resize: vertical;
    min-height: 6.5rem;
    line-height: 1.45;
  }

  // ── Inline annotations ──────────────────────────
  &__hint {
    font-family: $ibmpm;
    font-size: $fs-small;
    color: $color-text;
    opacity: 0.45;
  }
  &__counter {
    align-self: flex-end;
    font-family: $ibmpm;
    font-size: $fs-small;
    color: $color-text;
    opacity: 0.55;
  }
  &__counter--over { color: #ff6b6b; opacity: 1; }
  &__error {
    font-family: $ibmpm;
    font-size: $fs-small;
    color: #ff6b6b;
  }

  // ── Avatar slots ────────────────────────────────
  &__avatar {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    flex-wrap: wrap;
  }
  &__slot {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 0;
    background: transparent;
    border: 1px solid $color-iron-gray;
    border-radius: 5px;
    overflow: hidden;
    transition: border-color 180ms ease, transform 180ms ease;
  }
  &__slot-img {
    display: block;
    object-fit: cover;
    background: $color-onyx;
  }
  &__slot-img--empty {
    display: grid;
    place-items: center;
    background: $color-shadow-gray-2;
    color: $color-text;
    opacity: 0.4;
    font-family: $ibmpm;
    font-size: $fs-small;
  }
  &__slot-tag {
    padding: 0.3rem 0.55rem;
    background: $color-shadow-gray-2;
    color: $color-text;
    font-family: $ibmpm;
    font-size: $fs-small;
    text-align: left;
    border-top: 1px solid $color-iron-gray;
    opacity: 0.75;
  }
  &__slot--current {
    cursor: default;
    .profile-edit__slot-img { width: 180px; height: 180px; }
    .profile-edit__slot-tag { opacity: 1; }
  }
  &__slot--past {
    cursor: pointer;
    .profile-edit__slot-img { width: 84px; height: 84px; }
    &:not(:disabled):hover,
    &:not(:disabled):focus-visible {
      outline: none;
      border-color: $color-text;
      transform: translateY(-2px);
      .profile-edit__slot-tag { opacity: 1; }
    }
    &:disabled { opacity: 0.45; cursor: not-allowed; }
  }
  &__history {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    align-self: stretch;
  }

  // ── Upload ──────────────────────────────────────
  &__upload {
    position: relative;
    display: inline-flex;
    cursor: pointer;
  }
  &__upload-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    &:disabled { cursor: not-allowed; }
  }
  &__upload-cta {
    display: inline-block;
    padding: 0.55rem 0.85rem;
    border: 1px dashed $color-iron-gray;
    border-radius: 4px;
    font-family: $ibmpm;
    font-size: $fs-small;
    color: $color-text;
    opacity: 0.8;
    transition: opacity 180ms ease, border-color 180ms ease, text-shadow 180ms ease;
  }
  &__upload:hover &__upload-cta {
    opacity: 1;
    border-color: $color-text;
    text-shadow: $glow-25-white;
  }

  // ── Actions ─────────────────────────────────────
  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 0.25rem;
    padding-top: 1rem;
    border-top: 1px dashed $color-iron-gray;
  }
  &__btn {
    padding: 0.6rem 1.25rem;
    background: transparent;
    border: 1px solid $color-iron-gray;
    border-radius: 4px;
    font-family: $ibmpm;
    font-size: $fs-small;
    color: $color-text;
    cursor: pointer;
    opacity: 0.85;
    transition: opacity 180ms ease, border-color 180ms ease, text-shadow 180ms ease, background 180ms ease;

    &:disabled { opacity: 0.35; cursor: not-allowed; }
    &:not(:disabled):hover,
    &:not(:disabled):focus-visible {
      outline: none;
      opacity: 1;
      border-color: $color-text;
      text-shadow: $glow-25-white;
    }
  }
  &__btn--commit { background: $color-shadow-gray-2; }

  @media (max-width: $bp-md) {
    padding: 1.5rem 1rem 2.5rem;
    &__title { font-size: $fs-h2; }
    &__slot--current .profile-edit__slot-img { width: 140px; height: 140px; }
  }
}
</style>
