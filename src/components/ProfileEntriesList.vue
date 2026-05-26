<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useEntries, type EntryRow } from '@/composables/useEntries'
import EntryCard from './EntryCard.vue'

const PAGE_SIZE = 5

const entries = ref<EntryRow[]>([])
const loading = ref(true)
const fetching = ref(false)
const done = ref(false)
const error = ref<string | null>(null)
const sentinel = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null
const { listMyEntries } = useEntries()

async function loadMore() {
  if (fetching.value || done.value) return
  fetching.value = true
  loading.value = true
  error.value = null
  const res = await listMyEntries({ limit: PAGE_SIZE, offset: entries.value.length })
  if (res.error) {
    error.value = res.error.message ?? 'Failed to load entries'
    loading.value = false
    fetching.value = false
    return
  }
  const batch = (res.data ?? []) as EntryRow[]
  entries.value.push(...batch)
  if (batch.length < PAGE_SIZE) done.value = true
  loading.value = false
  fetching.value = false
}

onMounted(async () => {
  await loadMore()
  observer = new IntersectionObserver((rows) => {
    if (rows.some((r) => r.isIntersecting)) loadMore()
  })
  if (sentinel.value) observer.observe(sentinel.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section class="profile-entries">
    <header class="profile-entries__header">
      <span class="profile-entries__rule"></span>
      <h2 class="profile-entries__title">Your Entries</h2>
      <span class="profile-entries__rule"></span>
    </header>

    <div v-if="error" class="profile-entries__error">
      <p>{{ error }}</p>
      <button
        type="button"
        data-testid="profile-entries-retry"
        @click="loadMore"
      >Retry</button>
    </div>

    <template v-else>
      <EntryCard v-for="e in entries" :key="e.id" :entry="e" />

      <template v-if="loading">
        <div
          v-for="n in PAGE_SIZE"
          :key="`sk-${n}`"
          class="profile-entries__skeleton"
          data-testid="profile-entry-skeleton"
        ></div>
      </template>

      <p
        v-if="done && entries.length === 0"
        class="profile-entries__empty"
      >No entries yet — <router-link to="/journal">start journaling</router-link>.</p>

      <div ref="sentinel" v-if="!done" class="profile-entries__sentinel" aria-hidden="true"></div>
    </template>
  </section>
</template>

<style lang="scss" scoped>
.profile-entries {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1rem 0;
  }
  &__rule {
    flex: 1;
    height: 1px;
    background: $color-iron-gray;
  }
  &__title {
    margin: 0;
    font-size: 0.95rem;
    color: lighten($color-iron-gray, 20%);
    font-weight: 400;
  }

  &__skeleton {
    height: 6rem;
    border-radius: 8px;
    background: linear-gradient(90deg, $color-shadow-gray-2 0%, $color-gunmetal 50%, $color-shadow-gray-2 100%);
    background-size: 200% 100%;
    animation: profile-skeleton-pulse 1.4s ease-in-out infinite;
  }

  &__empty {
    text-align: center;
    color: lighten($color-iron-gray, 20%);
  }

  &__error {
    text-align: center;
    padding: 1rem;
    color: lighten($color-iron-gray, 20%);
  }

  &__sentinel { height: 1px; }
}

@keyframes profile-skeleton-pulse {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
