<script setup lang="ts">
import { RouterView } from 'vue-router'
import EntryTabsNav from '@/components/EntryTabsNav.vue'
</script>

<template>
  <section class="entries">
    <EntryTabsNav />
    <RouterView />
  </section>
</template>

<style lang="scss" scoped>
.entries {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 100px;
  color: $color-text;

  @media (max-width: $bp-md) {
    padding: 0 1rem;
  }
}
</style>
