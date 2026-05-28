<script setup lang="ts">
import TheNav from './components/TheNav.vue'
import TheFooter from './components/TheFooter.vue'
import StarField from './components/StarField.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <StarField :seed="1337" />
  <main>
    <TheNav />
    <RouterView />
  </main>
  <TheFooter />
</template>

<style lang="scss" scoped></style>
