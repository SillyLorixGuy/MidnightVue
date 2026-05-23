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
.auth {
  max-width: 400px;
  margin: 4rem auto;
  padding: 2rem;
  background: $color-shadow-gray;
  border-radius: 10px;
  color: $color-text;
  font-family: $ibmpm;

  h1 {
    font-family: $oxanium;
    font-size: $fs-h1;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .oauth {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;

    button {
      padding: 0.6rem;
      background: $color-iron-gray;
      color: $color-text;
      border: none;
      border-radius: 5px;
      font-family: $ibmpm;
      cursor: pointer;

      &:hover { background: $color-gunmetal; }
    }
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: $fs-small;
    }

    input {
      padding: 0.5rem;
      background: $color-shadow-gray-2;
      color: $color-text;
      border: 1px solid $color-iron-gray;
      border-radius: 5px;
      font-family: $ibmpm;
      font-size: $fs-p;
    }

    button[type='submit'] {
      margin-top: 0.5rem;
      padding: 0.6rem;
      background: $color-text;
      color: $color-onyx;
      border: none;
      border-radius: 5px;
      font-family: $oxanium;
      font-size: $fs-p;
      cursor: pointer;

      &:disabled { opacity: 0.6; cursor: progress; }
    }
  }

  .error {
    margin-top: 1rem;
    color: #ff8080;
    font-size: $fs-small;
  }

  .links {
    margin-top: 1.5rem;
    text-align: center;
    font-size: $fs-small;

    a { color: $color-text; text-decoration: underline; }
  }
}
</style>
