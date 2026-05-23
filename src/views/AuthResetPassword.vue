<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const password = ref('')
const confirm = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

const router = useRouter()
const { setNewPassword } = useAuth()

const match = computed(() => password.value.length >= 6 && password.value === confirm.value)

async function submit() {
  error.value = null
  if (!match.value) {
    error.value = 'Passwords must match and be at least 6 characters.'
    return
  }
  loading.value = true
  const { error: e } = await setNewPassword(password.value)
  loading.value = false
  if (e) { error.value = e.message; return }
  router.push('/journal')
}
</script>

<template>
  <section class="auth">
    <h1>Reset password</h1>
    <form @submit.prevent="submit">
      <label>
        New password
        <input v-model="password" type="password" required minlength="6" autocomplete="new-password" />
      </label>
      <label>
        Confirm password
        <input v-model="confirm" type="password" required minlength="6" autocomplete="new-password" />
      </label>
      <button type="submit" :disabled="loading || !match">{{ loading ? 'Saving…' : 'Save password' }}</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/auth-form' as *;
</style>
