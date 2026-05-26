<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProfile, type ProfileData } from '@/composables/useProfile'
import ProfileHeader from '@/components/ProfileHeader.vue'
import ProfileEntriesList from '@/components/ProfileEntriesList.vue'

const profile = ref<ProfileData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const { getMyProfile } = useProfile()

async function load() {
  loading.value = true
  error.value = null
  const { data, error: err } = await getMyProfile()
  if (err) {
    error.value = err.message ?? 'Could not load profile'
  } else {
    profile.value = data
  }
  loading.value = false
}

onMounted(load)
</script>

<template>
  <main class="the-profile">
    <div v-if="loading" class="the-profile__skeleton" data-testid="profile-skeleton">
      <div class="the-profile__skeleton-avatar"></div>
      <div class="the-profile__skeleton-lines">
        <div class="the-profile__skeleton-line"></div>
        <div class="the-profile__skeleton-line"></div>
        <div class="the-profile__skeleton-line"></div>
      </div>
    </div>

    <div v-else-if="error" class="the-profile__error">
      <p>{{ error }}</p>
      <button type="button" @click="load">Retry</button>
    </div>

    <template v-else-if="profile">
      <ProfileHeader :profile="profile" />
      <ProfileEntriesList :profile="profile" />
    </template>
  </main>
</template>

<style lang="scss" scoped>
.the-profile {
  max-width: 720px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__skeleton {
    display: flex;
    gap: 1.25rem;
    padding: 1.25rem 1.5rem;
    border: 1px solid $color-iron-gray;
    border-radius: 8px;
  }
  &__skeleton-avatar {
    width: 200px;
    height: 200px;
    border-radius: 5px;
    background: $color-shadow-gray-2;
  }
  &__skeleton-lines {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  &__skeleton-line {
    height: 0.9rem;
    background: $color-shadow-gray-2;
    border-radius: 4px;
  }
  &__error {
    text-align: center;
    color: lighten($color-iron-gray, 20%);
    padding: 2rem 1rem;
  }
}
</style>
