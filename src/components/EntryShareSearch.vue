<script setup lang="ts">
import { ref } from 'vue'

const code = ref('')
const emit = defineEmits<{ submit: [code: string] }>()

function onSubmit() {
  const trimmed = code.value.trim()
  if (trimmed) {
    emit('submit', trimmed)
    code.value = ''
  }
}
</script>

<template>
  <form class="share-search" @submit.prevent="onSubmit">
    <input
      v-model="code"
      type="text"
      placeholder="Search an entry with a share code:"
      aria-label="Share code"
    />
  </form>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.share-search {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;

  input {
    width: 100%;
    max-width: 500px;
    background: $color-shadow-gray-2;
    color: $color-text;
    border: 1px solid $color-iron-gray;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-family: $ibmpm;
    font-size: 16px;
    transition: border-color 140ms ease, box-shadow 140ms ease;

    &::placeholder {
      color: $color-iron-gray;
      opacity: 0.85;
    }

    &:focus {
      outline: none;
      border-color: $color-text;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 0.5em rgba(255, 255, 255, 0.08);
    }
  }
}
</style>
