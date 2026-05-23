<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

const router = useRouter()
const route = useRoute()
const { signIn, signInWithOAuth } = useAuth()

async function submit() {
  error.value = null
  loading.value = true
  const { error: e } = await signIn({ email: email.value, password: password.value })
  loading.value = false
  if (e) {
    error.value = e.message
    return
  }
  const redirect = (route.query.redirect as string) || '/journal'
  router.push(redirect)
}

async function oauth(provider: 'google' | 'github' | 'discord') {
  error.value = null
  const { error: e } = await signInWithOAuth(provider)
  if (e) error.value = e.message
}
</script>

<template>
  <section class="auth">
    <h1>Log in</h1>

    <div class="oauth">
      <button type="button" @click="oauth('google')">Continue with Google</button>
      <button type="button" @click="oauth('github')">Continue with GitHub</button>
      <button type="button" @click="oauth('discord')">Continue with Discord</button>
    </div>

    <form @submit.prevent="submit">
      <label>
        Email
        <input v-model="email" type="email" required autocomplete="email" />
      </label>
      <label>
        Password
        <input v-model="password" type="password" required autocomplete="current-password" />
      </label>
      <button type="submit" :disabled="loading">{{ loading ? 'Signing in…' : 'Sign in' }}</button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>

    <p class="links">
      <RouterLink to="/forgot-password">Forgot password?</RouterLink>
      <span> · </span>
      <RouterLink to="/signup">Create an account</RouterLink>
    </p>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/auth-form' as *;
</style>
