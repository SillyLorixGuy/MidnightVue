<script setup lang="ts">
import { computed } from 'vue'
import type { ProfileData } from '@/composables/useProfile'

const props = defineProps<{ profile: ProfileData }>()

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatProfileDate(iso: string): string {
  const d = new Date(iso)
  return `${MONTHS[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`
}

const avatarSrc = computed(() => props.profile.avatar_url ?? '/default-avatar.png')
const userSince = computed(() => formatProfileDate(props.profile.created_at))
const lastSeen  = computed(() => formatProfileDate(props.profile.last_sign_in_at))
const hasBio    = computed(() => !!props.profile.bio && props.profile.bio.trim() !== '')
</script>

<template>
  <section class="profile-header">
    <div class="profile-header__identity">
      <img
        data-testid="profile-avatar"
        :src="avatarSrc"
        :alt="`${profile.username} avatar`"
        class="profile-header__avatar"
      />
      <div class="profile-header__name">{{ profile.username }}</div>
      <p
        v-if="hasBio"
        data-testid="profile-bio"
        class="profile-header__bio"
      >{{ profile.bio }}</p>
    </div>

    <ul class="profile-header__stats">
      <li>User since: {{ userSince }}</li>
      <li>Last seen: {{ lastSeen }}</li>
      <li>Total entries: {{ profile.total_entries }}</li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
.profile-header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid $color-iron-gray;
  border-radius: 8px;
  background: $color-shadow-gray-2;

  &__identity { display: flex; flex-direction: column; gap: 0.5rem; }

  &__avatar {
    width: 200px;
    height: 200px;
    border-radius: 5px;
    object-fit: cover;
    background: $color-onyx;
  }

  &__name {
    color: $color-text;
    font-family: $oxanium;
    font-size: $fs-h2;
  }

  &__bio {
    margin: 0;
    color: $color-text;
    font-family: $ibmpm;
    font-size: $fs-small;
    opacity: 0.85;
  }

  &__stats {
    margin: 0;
    padding: 0;
    list-style: none;
    text-align: right;
    color: $color-text;
    font-family: $ibmpm;
    font-size: $fs-small;

    li + li { margin-top: 0.25rem; }
  }

  @media (max-width: $bp-md) {
    flex-direction: column;
    align-items: flex-start;

    &__stats { text-align: left; }
  }
}
</style>
