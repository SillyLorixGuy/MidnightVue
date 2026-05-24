<script setup lang="ts">
import { ref, onMounted } from 'vue'
import EntryCard from '@/components/EntryCard.vue'
import { useAnchors } from '@/composables/useAnchors'

const { listAnchored, removeAnchor } = useAnchors()

interface AnchoredRow {
  id: string
  user_id: string
  title: string
  content: string
  mood: number | null
  share_code: string
  created_at: string
  author_username: string
  author_avatar_url: string | null
  anchored_at: string
}

const entries = ref<AnchoredRow[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  const { data, error: e } = await listAnchored()
  loading.value = false
  if (e) { error.value = e.message; return }
  entries.value = data ?? []
}

async function onUnanchor(entryId: string) {
  await removeAnchor(entryId)
  entries.value = entries.value.filter((e) => e.id !== entryId)
}

onMounted(load)
</script>

<template>
  <div class="anchored">
    <p class="subtitle">
      Entries that mean a lot to us and can be used as <span class="emphasis">emotional anchors.</span>
    </p>

    <p v-if="loading" class="state">[ loading… ]</p>
    <p v-else-if="error" class="state error">[ {{ error }} ]</p>
    <p v-else-if="entries.length === 0" class="state">[ no anchored entries yet ]</p>

    <ul v-else class="list">
      <li v-for="e in entries" :key="e.id">
        <EntryCard
          :entry="{
            id: e.id,
            title: e.title,
            content: e.content,
            created_at: e.created_at,
            share_code: e.share_code,
            author: { username: e.author_username, avatar_url: e.author_avatar_url },
          }"
          :is-anchored="true"
          @toggle-anchor="onUnanchor"
        />
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.anchored {
  font-family: $ibmpm;
  color: $color-text;
}

.subtitle {
  text-align: center;
  margin: 1rem 0 2rem;
  font-family: $ibmpm;
  font-size: $fs-small;
  opacity: 0.85;

  .emphasis {
    background: $color-iron-gray;
    padding: 0.05em 0.45em;
    border-radius: 3px;
    color: $color-text;
    text-shadow: $glow-25-white;
  }
}

.state {
  text-align: center;
  margin: 3rem 0;
  font-family: $ibmpm;
  font-size: $fs-small;
  color: $color-iron-gray;
  letter-spacing: 0.02em;

  &.error {
    color: #ff8080;
  }
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  li {
    animation: anchored-fade-in 180ms ease-out both;
  }
}

@keyframes anchored-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
