<script setup lang="ts">
import { ref } from 'vue'
import EntryShareSearch from '@/components/EntryShareSearch.vue'
import EntryCard from '@/components/EntryCard.vue'
import { useEntries } from '@/composables/useEntries'
import { useAnchors } from '@/composables/useAnchors'

interface SharedRow {
  id: string
  title: string
  content: string
  share_code: string
  created_at: string
  author_username: string
  author_avatar_url: string | null
  isAnchored: boolean
}

const { getByShareCode } = useEntries()
const { addAnchor, removeAnchor, isAnchored } = useAnchors()

const looked = ref<SharedRow[]>([])
const error = ref<string | null>(null)
const empty = ref(true)

async function onSubmit(code: string) {
  error.value = null
  // Already in list? skip duplicate fetch.
  if (looked.value.some((r) => r.share_code === code)) return

  const { data, error: e } = await getByShareCode(code)
  if (e) { error.value = e.message; return }
  if (!data) { error.value = 'No entry found for that code.'; return }

  const anchored = await isAnchored(data.id)
  looked.value.unshift({ ...data, isAnchored: anchored })
  empty.value = false
}

async function onToggleAnchor(entryId: string) {
  const row = looked.value.find((r) => r.id === entryId)
  if (!row) return
  if (row.isAnchored) {
    await removeAnchor(entryId)
  } else {
    await addAnchor(entryId)
  }
  row.isAnchored = !row.isAnchored
}
</script>

<template>
  <div class="shared">
    <EntryShareSearch @submit="onSubmit" />

    <p v-if="empty && !error" class="state">Enter a code to see a shared entry.</p>
    <p v-if="error" class="state error">[ {{ error }} ]</p>

    <ul class="list">
      <li v-for="r in looked" :key="r.id">
        <EntryCard
          :entry="{
            id: r.id,
            title: r.title,
            content: r.content,
            created_at: r.created_at,
            share_code: r.share_code,
            author: { username: r.author_username, avatar_url: r.author_avatar_url },
          }"
          :is-anchored="r.isAnchored"
          @toggle-anchor="onToggleAnchor"
        />
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.shared {
  font-family: $ibmpm;
  color: $color-text;
}

.state {
  text-align: center;
  margin: 2rem 0;
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
    animation: shared-fade-in 180ms ease-out both;
  }
}

@keyframes shared-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
