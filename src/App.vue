<script setup lang="ts">
import TheNav from './components/TheNav.vue'
import TheFooter from './components/TheFooter.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <main>
    <TheNav />
    <RouterView />
  </main>
  <TheFooter />
</template>

<style lang="scss" scoped></style>
