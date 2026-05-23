<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const email = ref('')
const error = ref<string | null>(null)
const sent = ref(false)
const loading = ref(false)

const { requestPasswordReset } = useAuth()

async function submit() {
  error.value = null
  loading.value = true
  const { error: e } = await requestPasswordReset(email.value)
  loading.value = false
  if (e) { error.value = e.message; return }
  sent.value = true
}
</script>

<template>
  <section class="auth">
    <h1>Forgot password</h1>

    <template v-if="!sent">
      <p class="lead">Enter your email and we'll send you a reset link.</p>
      <form @submit.prevent="submit">
        <label>
          Email
          <input v-model="email" type="email" required autocomplete="email" />
        </label>
        <button type="submit" :disabled="loading">{{ loading ? 'Sending…' : 'Send reset link' }}</button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
    </template>

    <p v-else class="lead">Check your inbox for a reset link.</p>

    <p class="links">
      <RouterLink to="/login">Back to log in</RouterLink>
    </p>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/auth-form' as *;

.lead {
  text-align: center;
  font-size: $fs-small;
  margin-bottom: 1rem;
}
</style>
