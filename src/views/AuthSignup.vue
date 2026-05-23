<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const email = ref('')
const password = ref('')
const username = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

const router = useRouter()
const { signUp, signInWithOAuth } = useAuth()

const usernameValid = computed(() => /^[a-z0-9_]{3,20}$/.test(username.value))

async function submit() {
  error.value = null
  if (!usernameValid.value) {
    error.value = 'Username must be 3–20 lowercase letters, digits, or underscores.'
    return
  }
  loading.value = true
  const { error: e } = await signUp({
    email: email.value,
    password: password.value,
    username: username.value,
  })
  loading.value = false
  if (e) {
    error.value = e.message
    return
  }
  router.push('/journal')
}

async function oauth(provider: 'google' | 'github' | 'discord') {
  error.value = null
  const { error: e } = await signInWithOAuth(provider)
  if (e) error.value = e.message
}
</script>

<template>
  <section class="auth">
    <h1>Create account</h1>

    <div class="oauth">
      <button type="button" @click="oauth('google')">Continue with Google</button>
      <button type="button" @click="oauth('github')">Continue with GitHub</button>
      <button type="button" @click="oauth('discord')">Continue with Discord</button>
    </div>

    <form @submit.prevent="submit">
      <label>
        Username
        <input v-model="username" type="text" required minlength="3" maxlength="20" pattern="[a-z0-9_]{3,20}" />
      </label>
      <label>
        Email
        <input v-model="email" type="email" required autocomplete="email" />
      </label>
      <label>
        Password
        <input v-model="password" type="password" required autocomplete="new-password" minlength="6" />
      </label>
      <button type="submit" :disabled="loading">{{ loading ? 'Creating…' : 'Sign up' }}</button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>

    <p class="links">
      Already have an account? <RouterLink to="/login">Log in</RouterLink>
    </p>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/auth-form' as *;
</style>
