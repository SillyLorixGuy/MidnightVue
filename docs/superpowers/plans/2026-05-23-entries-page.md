# Entries Page + Supabase Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Entries page (Shared + Anchored sub-pages) to MidnightVue, with a Supabase backend, email/password + OAuth auth, password reset, and persistent entry storage with sharing and anchoring.

**Architecture:** Vue 3 + Vite + TypeScript + SCSS frontend with Vue Router nested routes. Supabase (Postgres + Auth) backend. Three normalized tables (`profiles`, `entries`, `anchors`) with RLS, plus two SECURITY DEFINER functions for cross-user reads (share-code lookup, anchor feed). Composables (`useAuth`, `useEntries`, `useAnchors`) encapsulate all Supabase calls; views and components stay presentational.

**Tech Stack:** Vue 3.5, Vue Router, TypeScript, SCSS, Vitest (added in Task 1), `@supabase/supabase-js`, Supabase CLI for versioned migrations.

**Testing strategy:**
- TDD for composables (pure logic, easy to unit-test with a mocked Supabase client).
- Smoke tests for Vue components (mount + assert key text renders).
- Manual verification at the end of each phase using `/run`.
- Migrations validated by applying to a local/cloud Supabase project and inspecting schema + RLS.

**Spec:** [docs/superpowers/specs/2026-05-23-entries-page-design.md](../specs/2026-05-23-entries-page-design.md)

**Commit policy:** Code commits per task (per below). Do NOT commit anything under `docs/` — the user manages doc commits separately.

---

## Phase 1 — Foundation: Supabase + Auth + Testing

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime + dev dependencies**

Run:
```bash
npm install @supabase/supabase-js
npm install -D vitest @vue/test-utils @vitest/coverage-v8 jsdom @types/node
```

Expected: `package.json` updated, `package-lock.json` regenerated, no errors.

- [ ] **Step 2: Add test scripts to package.json**

Edit `package.json` scripts section:
```json
"scripts": {
  "dev": "vite",
  "build": "vue-tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run"
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add supabase-js and vitest dependencies"
```

---

### Task 2: Vitest configuration

**Files:**
- Create: `vitest.config.ts`
- Create: `tsconfig.vitest.json`
- Modify: `tsconfig.json` (add reference if multi-project setup)

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
})
```

- [ ] **Step 2: Write a sanity-check test**

Create `src/sanity.test.ts`:
```ts
import { describe, it, expect } from 'vitest'

describe('vitest', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 3: Run tests to verify setup**

Run: `npm run test:run`
Expected: 1 passing test.

- [ ] **Step 4: Delete the sanity test**

Run: `rm src/sanity.test.ts` (PowerShell: `Remove-Item src/sanity.test.ts`)

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json
git commit -m "chore: configure vitest with jsdom"
```

---

### Task 3: Environment variables scaffolding

**Files:**
- Create: `.env.example`
- Modify: `.gitignore` (verify `.env` is ignored)
- Create: `src/env.d.ts`

- [ ] **Step 1: Create `.env.example`**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 2: Verify `.gitignore` contains `.env`**

Read `.gitignore`. If `.env` is not listed, add it. (Do not create `.env` itself — user fills it locally.)

- [ ] **Step 3: Create TypeScript declarations for env vars**

Create `src/env.d.ts`:
```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

- [ ] **Step 4: Commit**

```bash
git add .env.example .gitignore src/env.d.ts
git commit -m "chore: scaffold supabase env vars and types"
```

---

### Task 4: Supabase migration — schema, RLS, functions

**Files:**
- Create: `supabase/migrations/0001_init.sql`
- Create: `supabase/README.md` (one-page runbook)

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0001_init.sql`:

```sql
-- =========================================
-- 0001_init.sql — MidnightVue initial schema
-- =========================================

-- ---------- TABLES ----------

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null check (username ~ '^[a-z0-9_]{3,20}$'),
  avatar_url  text,
  bio         text,
  created_at  timestamptz not null default now()
);

create table public.entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  content      text not null,
  mood         smallint,
  share_code   uuid unique not null default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.anchors (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  entry_id    uuid not null references public.entries(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, entry_id)
);

create index entries_user_id_created_at_idx on public.entries (user_id, created_at desc);
create index anchors_user_id_created_at_idx on public.anchors (user_id, created_at desc);

-- ---------- updated_at trigger ----------

create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger entries_touch_updated_at
  before update on public.entries
  for each row execute function public.touch_updated_at();

-- ---------- RLS ----------

alter table public.profiles enable row level security;
alter table public.entries  enable row level security;
alter table public.anchors  enable row level security;

-- profiles: anyone authenticated can read, only owner can insert/update
create policy "profiles_select_authenticated" on public.profiles
  for select to authenticated using (true);

create policy "profiles_insert_self" on public.profiles
  for insert to authenticated with check (id = auth.uid());

create policy "profiles_update_self" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- entries: owner-only access (cross-user reads go through SECURITY DEFINER fns)
create policy "entries_select_own" on public.entries
  for select to authenticated using (user_id = auth.uid());

create policy "entries_insert_own" on public.entries
  for insert to authenticated with check (user_id = auth.uid());

create policy "entries_update_own" on public.entries
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "entries_delete_own" on public.entries
  for delete to authenticated using (user_id = auth.uid());

-- anchors: caller-only access
create policy "anchors_select_own" on public.anchors
  for select to authenticated using (user_id = auth.uid());

create policy "anchors_insert_own" on public.anchors
  for insert to authenticated with check (user_id = auth.uid());

create policy "anchors_delete_own" on public.anchors
  for delete to authenticated using (user_id = auth.uid());

-- ---------- SECURITY DEFINER functions ----------

-- Public lookup of any entry by its share_code (returns one row or nothing).
create or replace function public.get_entry_by_share_code(code uuid)
returns table (
  id          uuid,
  user_id     uuid,
  title       text,
  content     text,
  mood        smallint,
  share_code  uuid,
  created_at  timestamptz,
  author_username   text,
  author_avatar_url text
)
language sql
security definer
set search_path = public
as $$
  select
    e.id, e.user_id, e.title, e.content, e.mood, e.share_code, e.created_at,
    p.username, p.avatar_url
  from public.entries e
  join public.profiles p on p.id = e.user_id
  where e.share_code = code
$$;

grant execute on function public.get_entry_by_share_code(uuid) to authenticated;

-- Caller's anchored entries with author profile data, newest anchor first.
create or replace function public.get_my_anchored_entries()
returns table (
  id          uuid,
  user_id     uuid,
  title       text,
  content     text,
  mood        smallint,
  share_code  uuid,
  created_at  timestamptz,
  author_username   text,
  author_avatar_url text,
  anchored_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    e.id, e.user_id, e.title, e.content, e.mood, e.share_code, e.created_at,
    p.username, p.avatar_url,
    a.created_at as anchored_at
  from public.anchors a
  join public.entries e  on e.id = a.entry_id
  join public.profiles p on p.id = e.user_id
  where a.user_id = auth.uid()
  order by a.created_at desc
$$;

grant execute on function public.get_my_anchored_entries() to authenticated;
```

- [ ] **Step 2: Write `supabase/README.md`**

```markdown
# Supabase setup

## Local dev (one-time)
1. Create a Supabase project at https://supabase.com (free tier).
2. Copy the project URL and anon key into `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```
3. Apply migrations:
   - **Option A (CLI):** install Supabase CLI (`npm i -g supabase`), then `supabase link --project-ref <ref>` and `supabase db push`.
   - **Option B (dashboard):** paste the contents of each `migrations/*.sql` file into the SQL editor in order.

## OAuth providers
Enable Google, GitHub, and Discord in Authentication → Providers. For each, you need a client ID/secret from the provider's developer portal (see Task 12 for steps).

## Redirect URLs
Add the following to Authentication → URL Configuration → Redirect URLs:
- `http://localhost:5173/journal`
- `http://localhost:5173/reset-password`
- (Plus production URLs when deploying.)
```

- [ ] **Step 3: Apply the migration to your Supabase project (manual)**

Either via CLI `supabase db push` or by pasting `0001_init.sql` into the dashboard SQL editor. Verify in Table Editor that `profiles`, `entries`, `anchors` exist and RLS is enabled (lock icon in dashboard).

- [ ] **Step 4: Commit migration + runbook**

```bash
git add supabase/
git commit -m "feat(db): add initial schema, RLS, and security-definer functions"
```

---

### Task 5: Supabase client init

**Files:**
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Write the client init**

```ts
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add supabase client init"
```

---

### Task 6: `useAuth` composable (TDD)

**Files:**
- Create: `src/composables/useAuth.ts`
- Create: `src/composables/useAuth.test.ts`

The composable holds session state and exposes sign in/up/out, OAuth, password reset, and a guard helper. Tests mock `supabase.auth` methods.

- [ ] **Step 1: Write failing tests**

Create `src/composables/useAuth.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'

vi.mock('@/lib/supabase', () => {
  const listeners: Array<(event: string, session: any) => void> = []
  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn((cb: any) => {
          listeners.push(cb)
          return { data: { subscription: { unsubscribe: vi.fn() } } }
        }),
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signInWithOAuth: vi.fn(),
        signOut: vi.fn(),
        resetPasswordForEmail: vi.fn(),
        updateUser: vi.fn(),
      },
      from: vi.fn(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      })),
    },
    __emit: (event: string, session: any) => listeners.forEach((l) => l(event, session)),
  }
})

import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase'

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('signUp creates auth user then inserts profile row', async () => {
    ;(supabase.auth.signUp as any).mockResolvedValue({
      data: { user: { id: 'u1' }, session: null },
      error: null,
    })
    const insert = vi.fn().mockResolvedValue({ error: null })
    ;(supabase.from as any).mockReturnValue({ insert })

    const { signUp } = useAuth()
    const result = await signUp({ email: 'a@b.c', password: 'pw', username: 'alice_01' })

    expect(supabase.auth.signUp).toHaveBeenCalledWith({ email: 'a@b.c', password: 'pw' })
    expect(supabase.from).toHaveBeenCalledWith('profiles')
    expect(insert).toHaveBeenCalledWith({ id: 'u1', username: 'alice_01' })
    expect(result.error).toBeNull()
  })

  it('signIn delegates to signInWithPassword', async () => {
    ;(supabase.auth.signInWithPassword as any).mockResolvedValue({ error: null })
    const { signIn } = useAuth()
    await signIn({ email: 'a@b.c', password: 'pw' })
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.c', password: 'pw' })
  })

  it('signInWithOAuth passes provider and redirectTo', async () => {
    ;(supabase.auth.signInWithOAuth as any).mockResolvedValue({ error: null })
    const { signInWithOAuth } = useAuth()
    await signInWithOAuth('google')
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: expect.stringContaining('/journal') },
    })
  })

  it('requestPasswordReset sends recovery email with reset redirect', async () => {
    ;(supabase.auth.resetPasswordForEmail as any).mockResolvedValue({ error: null })
    const { requestPasswordReset } = useAuth()
    await requestPasswordReset('a@b.c')
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'a@b.c',
      { redirectTo: expect.stringContaining('/reset-password') }
    )
  })

  it('setNewPassword delegates to updateUser', async () => {
    ;(supabase.auth.updateUser as any).mockResolvedValue({ error: null })
    const { setNewPassword } = useAuth()
    await setNewPassword('newpw')
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newpw' })
  })

  it('isAuthenticated reflects session presence', async () => {
    const { isAuthenticated, _onAuthChange } = useAuth() as any
    expect(isAuthenticated.value).toBe(false)
    _onAuthChange('SIGNED_IN', { user: { id: 'u1' } })
    expect(isAuthenticated.value).toBe(true)
    _onAuthChange('SIGNED_OUT', null)
    expect(isAuthenticated.value).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- useAuth`
Expected: FAIL with "Cannot find module './useAuth'" or similar.

- [ ] **Step 3: Implement `useAuth`**

Create `src/composables/useAuth.ts`:
```ts
import { ref, computed, readonly } from 'vue'
import type { Session, User, Provider } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const session = ref<Session | null>(null)
const user = ref<User | null>(null)
let initialized = false

function origin(): string {
  return typeof window !== 'undefined' ? window.location.origin : ''
}

function applySession(s: Session | null) {
  session.value = s
  user.value = s?.user ?? null
}

export function useAuth() {
  if (!initialized) {
    initialized = true
    supabase.auth.getSession().then(({ data }) => applySession(data.session))
    supabase.auth.onAuthStateChange((_event, s) => applySession(s))
  }

  async function signUp(input: { email: string; password: string; username: string }) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
    })
    if (error || !data.user) return { error }
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, username: input.username })
    return { error: profileError }
  }

  async function signIn(input: { email: string; password: string }) {
    return supabase.auth.signInWithPassword(input)
  }

  async function signInWithOAuth(provider: Provider) {
    return supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${origin()}/journal` },
    })
  }

  async function signOut() {
    return supabase.auth.signOut()
  }

  async function requestPasswordReset(email: string) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin()}/reset-password`,
    })
  }

  async function setNewPassword(password: string) {
    return supabase.auth.updateUser({ password })
  }

  return {
    session: readonly(session),
    user: readonly(user),
    isAuthenticated: computed(() => !!session.value),
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    requestPasswordReset,
    setNewPassword,
    // exposed for tests only
    _onAuthChange: (_event: string, s: Session | null) => applySession(s),
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- useAuth`
Expected: 6 passing tests.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useAuth.ts src/composables/useAuth.test.ts
git commit -m "feat: add useAuth composable with session + signup/in/out/oauth/reset"
```

---

### Task 7: Router refactor — nested routes + auth guard

**Files:**
- Modify: `src/router/main.ts`

- [ ] **Step 1: Rewrite `src/router/main.ts`**

```ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/journal' },
  {
    path: '/journal',
    component: () => import('@/views/TheJournal.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/entries',
    component: () => import('@/views/TheEntries.vue'),
    meta: { requiresAuth: true },
    redirect: '/entries/anchored',
    children: [
      { path: 'shared', component: () => import('@/views/SharedEntries.vue') },
      { path: 'anchored', component: () => import('@/views/AnchoredEntries.vue') },
    ],
  },
  { path: '/login', component: () => import('@/views/AuthLogin.vue') },
  { path: '/signup', component: () => import('@/views/AuthSignup.vue') },
  { path: '/forgot-password', component: () => import('@/views/AuthForgotPassword.vue') },
  { path: '/reset-password', component: () => import('@/views/AuthResetPassword.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const AUTH_ROUTES = new Set(['/login', '/signup', '/forgot-password', '/reset-password'])

router.beforeEach((to) => {
  const { isAuthenticated } = useAuth()
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (AUTH_ROUTES.has(to.path) && isAuthenticated.value && to.path !== '/reset-password') {
    return { path: '/journal' }
  }
  return true
})

export default router
```

- [ ] **Step 2: Move TheJournal to `views/` (do this now since the router references it)**

```bash
mkdir -p src/views
git mv src/components/TheJournal.vue src/views/TheJournal.vue
```

Update the import in `src/App.vue`:
```vue
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
```

(`TheJournal` is no longer imported at the App level — it's rendered via the router on `/journal`.)

- [ ] **Step 3: Verify the dev server still runs**

Run: `npm run dev` (briefly). Open `/journal`. Expected: page renders (auth guard will redirect to `/login` since no session — that's expected, and `/login` is empty until Task 8 so a blank page is OK for now).

- [ ] **Step 4: Commit**

```bash
git add src/router/main.ts src/views/TheJournal.vue src/App.vue
git commit -m "refactor: convert to nested routes and move TheJournal to views/"
```

---

### Task 8: AuthLogin view

**Files:**
- Create: `src/views/AuthLogin.vue`

- [ ] **Step 1: Write the component**

```vue
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
```

- [ ] **Step 2: Commit**

```bash
git add src/views/AuthLogin.vue
git commit -m "feat: add AuthLogin view with OAuth + password fields"
```

---

### Task 9: AuthSignup view

**Files:**
- Create: `src/views/AuthSignup.vue`

- [ ] **Step 1: Write the component**

```vue
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
/* Styles imported from shared partial in Step 3 below. */
</style>
```

> **Style sharing note:** The shared form styles will be extracted into `src/assets/scss/_auth-form.scss` in Step 2 and imported into both `AuthLogin.vue` and `AuthSignup.vue` in Step 3.

- [ ] **Step 2: Extract shared auth styles**

Create `src/assets/scss/_auth-form.scss`:
```scss
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
```

- [ ] **Step 3: Replace style block in both `AuthLogin.vue` and `AuthSignup.vue` with the import**

In each file, change `<style lang="scss" scoped>...</style>` to:
```vue
<style lang="scss" scoped>
@use '@/assets/scss/auth-form' as *;
</style>
```

(Note: `_auth-form.scss` with the leading underscore is imported as `auth-form`.)

- [ ] **Step 4: Commit**

```bash
git add src/views/AuthSignup.vue src/views/AuthLogin.vue src/assets/scss/_auth-form.scss
git commit -m "feat: add AuthSignup view and extract shared auth form styles"
```

---

### Task 10: AuthForgotPassword view

**Files:**
- Create: `src/views/AuthForgotPassword.vue`

- [ ] **Step 1: Write the component**

```vue
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
```

- [ ] **Step 2: Commit**

```bash
git add src/views/AuthForgotPassword.vue
git commit -m "feat: add AuthForgotPassword view"
```

---

### Task 11: AuthResetPassword view

**Files:**
- Create: `src/views/AuthResetPassword.vue`

- [ ] **Step 1: Write the component**

```vue
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
```

- [ ] **Step 2: Commit**

```bash
git add src/views/AuthResetPassword.vue
git commit -m "feat: add AuthResetPassword view"
```

---

### Task 12: OAuth provider configuration (manual, documented)

**Files:**
- Modify: `supabase/README.md`

- [ ] **Step 1: Add OAuth setup section to `supabase/README.md`**

Append:
```markdown
## OAuth provider setup (one-time per provider)

### Google
1. Go to https://console.cloud.google.com → APIs & Services → Credentials.
2. Create OAuth 2.0 Client ID, type "Web application".
3. Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
4. Copy Client ID and Client Secret into Supabase Dashboard → Authentication → Providers → Google.

### GitHub
1. https://github.com/settings/developers → New OAuth App.
2. Authorization callback URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
3. Copy Client ID + generate a Client Secret → paste into Supabase → Authentication → Providers → GitHub.

### Discord
1. https://discord.com/developers/applications → New Application → OAuth2.
2. Add redirect: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
3. Copy Client ID + Client Secret → paste into Supabase → Authentication → Providers → Discord.
```

- [ ] **Step 2: This step is manual — perform the dashboard setup**

Apply the steps above in the Supabase dashboard for each provider you want active. (Skipping any is fine — the OAuth button just errors with "provider not enabled" for unconfigured ones.)

- [ ] **Step 3: Commit the doc**

```bash
git add supabase/README.md
git commit -m "docs: add oauth provider setup instructions"
```

---

### Task 13: Post-OAuth username auto-generation

**Files:**
- Modify: `src/composables/useAuth.ts`
- Modify: `src/composables/useAuth.test.ts`

When a user signs in via OAuth for the first time, `auth.users` has a row but `profiles` does not. We need to detect this and insert a generated username.

- [ ] **Step 1: Add failing test for `ensureProfile`**

Append to `src/composables/useAuth.test.ts`:
```ts
describe('useAuth.ensureProfile', () => {
  beforeEach(() => vi.clearAllMocks())

  it('inserts a generated username when profile is missing', async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: null })
    const insert = vi.fn().mockResolvedValue({ error: null })
    ;(supabase.from as any).mockReturnValue({
      select: () => ({ eq: () => ({ single }) }),
      insert,
    })

    const { ensureProfile } = useAuth() as any
    await ensureProfile({ id: 'u-abcdef01-2345-...' })

    expect(insert).toHaveBeenCalledTimes(1)
    const arg = insert.mock.calls[0][0]
    expect(arg.id).toBe('u-abcdef01-2345-...')
    expect(arg.username).toMatch(/^user_[a-z0-9]{6}$/)
  })

  it('is a no-op when profile already exists', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 'u1', username: 'alice' }, error: null })
    const insert = vi.fn()
    ;(supabase.from as any).mockReturnValue({
      select: () => ({ eq: () => ({ single }) }),
      insert,
    })

    const { ensureProfile } = useAuth() as any
    await ensureProfile({ id: 'u1' })
    expect(insert).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- useAuth`
Expected: 2 new failures (`ensureProfile is not a function`).

- [ ] **Step 3: Implement `ensureProfile`**

Add to `src/composables/useAuth.ts` inside the `useAuth()` returned object, and wire it into the auth state change handler:

```ts
function generateUsername(userId: string): string {
  // 6 lowercase alphanumeric chars derived from the user id
  const hash = userId.replace(/-/g, '').toLowerCase().slice(0, 6)
  return `user_${hash}`
}

async function ensureProfile(u: { id: string }, attempt = 0): Promise<void> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', u.id)
    .single()
  if (data) return
  const username = attempt === 0
    ? generateUsername(u.id)
    : `${generateUsername(u.id)}${attempt}`
  const { error } = await supabase.from('profiles').insert({ id: u.id, username })
  if (error && attempt < 5) {
    // Likely a username collision — retry with a suffix.
    return ensureProfile(u, attempt + 1)
  }
}
```

Update `applySession` to call `ensureProfile` on sign-in:
```ts
function applySession(s: Session | null) {
  session.value = s
  user.value = s?.user ?? null
  if (s?.user) {
    // Fire-and-forget; we don't block UI on profile bootstrap.
    void ensureProfile(s.user)
  }
}
```

Add `ensureProfile` to the returned object (so tests can call it directly):
```ts
return {
  // ...existing
  ensureProfile,
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- useAuth`
Expected: all useAuth tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useAuth.ts src/composables/useAuth.test.ts
git commit -m "feat(auth): auto-generate profile + username for first-time OAuth sign-in"
```

---

### Task 14: TheNav person-icon dropdown

**Files:**
- Modify: `src/components/TheNav.vue`

(The current `TheNav.vue` has a person icon button. Convert it to a dropdown showing username + sign-out when authenticated, or a "Log in" link otherwise.)

- [ ] **Step 1: Read the existing TheNav.vue to find the person-icon block**

Use the Read tool on `src/components/TheNav.vue`.

- [ ] **Step 2: Wrap the person icon in a dropdown**

In the `<script setup>` block, add:
```ts
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const open = ref(false)
const router = useRouter()
const { isAuthenticated, user, signOut } = useAuth()

async function doSignOut() {
  await signOut()
  open.value = false
  router.push('/login')
}
```

In the template, replace the standalone person-icon button with:
```vue
<div class="profile-dropdown" @blur="open = false" tabindex="0">
  <button class="profile-button" @click="open = !open" aria-haspopup="true" :aria-expanded="open">
    <!-- existing person SVG stays here -->
  </button>
  <ul v-if="open" class="profile-menu" role="menu">
    <template v-if="isAuthenticated">
      <li class="profile-menu__user">{{ user?.email ?? 'Signed in' }}</li>
      <li><button @click="doSignOut">Sign out</button></li>
    </template>
    <template v-else>
      <li><RouterLink to="/login" @click="open = false">Log in</RouterLink></li>
      <li><RouterLink to="/signup" @click="open = false">Create account</RouterLink></li>
    </template>
  </ul>
</div>
```

Add scoped styles:
```scss
.profile-dropdown {
  position: relative;
  outline: none;
}
.profile-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: $color-shadow-gray-2;
  border: 1px solid $color-iron-gray;
  border-radius: 5px;
  list-style: none;
  padding: 0.25rem 0;
  min-width: 180px;
  z-index: 10;
  font-family: $ibmpm;
  font-size: $fs-small;

  li { padding: 0.5rem 0.75rem; }
  li button, li a {
    display: block;
    width: 100%;
    background: none;
    border: none;
    color: $color-text;
    text-align: left;
    cursor: pointer;
    text-decoration: none;
    &:hover { background: $color-gunmetal; }
  }
  &__user {
    color: $color-iron-gray;
    border-bottom: 1px solid $color-iron-gray;
    cursor: default;
  }
}
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`, log in, click the avatar. Expected: dropdown opens, shows email + "Sign out".

- [ ] **Step 4: Commit**

```bash
git add src/components/TheNav.vue
git commit -m "feat(nav): add account dropdown to person icon"
```

---

### Task 15: Phase 1 manual verification

- [ ] **Step 1: Use `/run` skill to launch the app**

The user runs `/run` in their session. Test cases:
- Visit `/` → redirects to `/login` (not authenticated yet).
- Submit signup with `email=test@test.com`, password ≥ 6 chars, username `testuser_1`.
- Lands on `/journal`, journal renders.
- Click avatar → dropdown shows email + Sign out.
- Sign out → returns to `/login`.
- Log in again → back to `/journal`.
- `/forgot-password` → submit email → "Check your inbox" message.
- Click reset link in email → lands on `/reset-password` → set new password → redirects to `/journal`.
- OAuth (for any configured providers) → sign in → lands on `/journal`. Verify a `profiles` row exists with `user_XXXXXX` username.

- [ ] **Step 2: Fix any issues found, commit fixes**

If any test fails, fix in place. Common issues: missing redirect URLs in Supabase dashboard (add them in Authentication → URL Configuration).

---

## Phase 2 — Entries Data + Anchored View

### Task 16: `useEntries` composable (TDD)

**Files:**
- Create: `src/composables/useEntries.ts`
- Create: `src/composables/useEntries.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/composables/useEntries.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
  },
}))

import { useEntries } from './useEntries'
import { supabase } from '@/lib/supabase'

describe('useEntries', () => {
  beforeEach(() => vi.clearAllMocks())

  it('createEntry inserts with the current user id', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 'e1' }, error: null })
    const insert = vi.fn().mockReturnValue({ select: () => ({ single }) })
    ;(supabase.from as any).mockReturnValue({ insert })

    const { createEntry } = useEntries()
    const { data, error } = await createEntry({ title: 'T', content: 'C', mood: 3 })

    expect(supabase.from).toHaveBeenCalledWith('entries')
    expect(insert).toHaveBeenCalledWith({ user_id: 'u1', title: 'T', content: 'C', mood: 3 })
    expect(data?.id).toBe('e1')
    expect(error).toBeNull()
  })

  it('listMyEntries fetches own entries newest first', async () => {
    const order = vi.fn().mockResolvedValue({ data: [{ id: 'e1' }], error: null })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    ;(supabase.from as any).mockReturnValue({ select })

    const { listMyEntries } = useEntries()
    const { data } = await listMyEntries()

    expect(select).toHaveBeenCalledWith('*')
    expect(eq).toHaveBeenCalledWith('user_id', 'u1')
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(data?.length).toBe(1)
  })

  it('getByShareCode calls the rpc function', async () => {
    ;(supabase.rpc as any).mockResolvedValue({ data: [{ id: 'e2' }], error: null })
    const { getByShareCode } = useEntries()
    const { data } = await getByShareCode('00000000-0000-0000-0000-000000000000')
    expect(supabase.rpc).toHaveBeenCalledWith('get_entry_by_share_code', {
      code: '00000000-0000-0000-0000-000000000000',
    })
    expect(data?.id).toBe('e2')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- useEntries`
Expected: 3 failures.

- [ ] **Step 3: Implement `useEntries`**

Create `src/composables/useEntries.ts`:
```ts
import { supabase } from '@/lib/supabase'

export interface EntryRow {
  id: string
  user_id: string
  title: string
  content: string
  mood: number | null
  share_code: string
  created_at: string
}

export interface EntryWithAuthor extends EntryRow {
  author_username: string
  author_avatar_url: string | null
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export function useEntries() {
  async function createEntry(input: { title: string; content: string; mood: number | null }) {
    const uid = await currentUserId()
    if (!uid) return { data: null, error: new Error('Not authenticated') }
    const { data, error } = await supabase
      .from('entries')
      .insert({ user_id: uid, title: input.title, content: input.content, mood: input.mood })
      .select()
      .single()
    return { data: data as EntryRow | null, error }
  }

  async function listMyEntries() {
    const uid = await currentUserId()
    if (!uid) return { data: null, error: new Error('Not authenticated') }
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    return { data: (data ?? []) as EntryRow[], error }
  }

  async function getByShareCode(code: string) {
    const { data, error } = await supabase.rpc('get_entry_by_share_code', { code })
    if (error) return { data: null, error }
    const row = Array.isArray(data) ? data[0] : data
    return { data: (row ?? null) as EntryWithAuthor | null, error: null }
  }

  return { createEntry, listMyEntries, getByShareCode }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- useEntries`
Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useEntries.ts src/composables/useEntries.test.ts
git commit -m "feat: add useEntries composable (createEntry, listMyEntries, getByShareCode)"
```

---

### Task 17: `useAnchors` composable (TDD)

**Files:**
- Create: `src/composables/useAnchors.ts`
- Create: `src/composables/useAnchors.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/composables/useAnchors.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
  },
}))

import { useAnchors } from './useAnchors'
import { supabase } from '@/lib/supabase'

describe('useAnchors', () => {
  beforeEach(() => vi.clearAllMocks())

  it('listAnchored calls rpc', async () => {
    ;(supabase.rpc as any).mockResolvedValue({ data: [{ id: 'e1' }], error: null })
    const { listAnchored } = useAnchors()
    const { data } = await listAnchored()
    expect(supabase.rpc).toHaveBeenCalledWith('get_my_anchored_entries')
    expect(data?.length).toBe(1)
  })

  it('addAnchor inserts pair', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null })
    ;(supabase.from as any).mockReturnValue({ insert })
    const { addAnchor } = useAnchors()
    await addAnchor('e1')
    expect(supabase.from).toHaveBeenCalledWith('anchors')
    expect(insert).toHaveBeenCalledWith({ user_id: 'u1', entry_id: 'e1' })
  })

  it('removeAnchor deletes by composite key', async () => {
    const second = vi.fn().mockResolvedValue({ error: null })
    const first = vi.fn().mockReturnValue({ eq: second })
    const del = vi.fn().mockReturnValue({ eq: first })
    ;(supabase.from as any).mockReturnValue({ delete: del })

    const { removeAnchor } = useAnchors()
    await removeAnchor('e1')
    expect(del).toHaveBeenCalled()
    expect(first).toHaveBeenCalledWith('user_id', 'u1')
    expect(second).toHaveBeenCalledWith('entry_id', 'e1')
  })

  it('isAnchored returns true when row exists', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id: 'a1' }, error: null })
    const eq2 = vi.fn().mockReturnValue({ maybeSingle })
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 })
    const select = vi.fn().mockReturnValue({ eq: eq1 })
    ;(supabase.from as any).mockReturnValue({ select })

    const { isAnchored } = useAnchors()
    expect(await isAnchored('e1')).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- useAnchors`

- [ ] **Step 3: Implement `useAnchors`**

Create `src/composables/useAnchors.ts`:
```ts
import { supabase } from '@/lib/supabase'
import type { EntryWithAuthor } from './useEntries'

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export function useAnchors() {
  async function listAnchored() {
    const { data, error } = await supabase.rpc('get_my_anchored_entries')
    return { data: (data ?? []) as (EntryWithAuthor & { anchored_at: string })[], error }
  }

  async function addAnchor(entryId: string) {
    const uid = await currentUserId()
    if (!uid) return { error: new Error('Not authenticated') }
    return supabase.from('anchors').insert({ user_id: uid, entry_id: entryId })
  }

  async function removeAnchor(entryId: string) {
    const uid = await currentUserId()
    if (!uid) return { error: new Error('Not authenticated') }
    return supabase.from('anchors').delete().eq('user_id', uid).eq('entry_id', entryId)
  }

  async function isAnchored(entryId: string): Promise<boolean> {
    const uid = await currentUserId()
    if (!uid) return false
    const { data } = await supabase
      .from('anchors')
      .select('id')
      .eq('user_id', uid)
      .eq('entry_id', entryId)
      .maybeSingle()
    return !!data
  }

  return { listAnchored, addAnchor, removeAnchor, isAnchored }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- useAnchors`
Expected: 4 passing.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useAnchors.ts src/composables/useAnchors.test.ts
git commit -m "feat: add useAnchors composable (list/add/remove/isAnchored)"
```

---

### Task 18: Wire `TheJournal` submit to `createEntry`

**Files:**
- Modify: `src/views/TheJournal.vue`

(The component already has a submit button; this step swaps the local-only handler for the real `useEntries.createEntry` call.)

- [ ] **Step 1: Read TheJournal.vue and locate the submit handler**

Use the Read tool on `src/views/TheJournal.vue`. Identify:
- The form / submit button's `@click` or `@submit` binding.
- The reactive refs holding title, content, mood.

- [ ] **Step 2: Replace the submit handler**

In the `<script setup>` block, add:
```ts
import { useEntries } from '@/composables/useEntries'

const { createEntry } = useEntries()
const submitting = ref(false)
const submitError = ref<string | null>(null)

async function onSubmit() {
  submitting.value = true
  submitError.value = null
  const { error } = await createEntry({
    title: title.value,           // adjust to actual ref name in file
    content: content.value,       // adjust to actual ref name in file
    mood: selectedMood.value,     // adjust to actual ref name in file
  })
  submitting.value = false
  if (error) { submitError.value = error.message; return }
  // Reset form
  title.value = ''
  content.value = ''
  selectedMood.value = null
}
```

Bind the existing submit button to `onSubmit` (`@click="onSubmit"` or `@submit.prevent="onSubmit"` on the form), and disable it while `submitting` is true.

Render `submitError` near the button if set.

- [ ] **Step 3: Test in browser**

Run `npm run dev`. Log in. Fill in the journal form. Submit. Open Supabase Table Editor → `entries`. A new row should appear with the correct `user_id` and a generated `share_code`.

- [ ] **Step 4: Commit**

```bash
git add src/views/TheJournal.vue
git commit -m "feat(journal): submit entries to supabase via useEntries"
```

---

### Task 19: `EntryCard` component (1:1 from Figma)

**Files:**
- Create: `src/components/EntryCard.vue`
- Create: `src/components/EntryCard.test.ts`

- [ ] **Step 1: Write a smoke test**

Create `src/components/EntryCard.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EntryCard from './EntryCard.vue'

const entry = {
  id: 'e1',
  title: 'Test Title',
  content: 'Some body content.',
  created_at: '2026-02-27T01:00:00Z',
  share_code: 'caa190ac-82c4-47c1-881e-193cca4ac345',
  author: { username: 'alice', avatar_url: null },
}

describe('EntryCard', () => {
  it('renders title, username, and content', () => {
    const wrapper = mount(EntryCard, { props: { entry, isAnchored: false } })
    expect(wrapper.text()).toContain('Test Title')
    expect(wrapper.text()).toContain('alice')
    expect(wrapper.text()).toContain('Some body content.')
    expect(wrapper.text()).toContain('caa190ac-82c4-47c1-881e-193cca4ac345')
  })

  it('emits toggle-anchor when bookmark clicked', async () => {
    const wrapper = mount(EntryCard, { props: { entry, isAnchored: false } })
    await wrapper.get('[data-testid="anchor-toggle"]').trigger('click')
    expect(wrapper.emitted('toggle-anchor')?.[0]).toEqual(['e1'])
  })

  it('toggles share-code reveal when eye clicked', async () => {
    const wrapper = mount(EntryCard, { props: { entry, isAnchored: false } })
    expect(wrapper.get('[data-testid="share-code"]').classes()).toContain('is-blurred')
    await wrapper.get('[data-testid="reveal-toggle"]').trigger('click')
    expect(wrapper.get('[data-testid="share-code"]').classes()).not.toContain('is-blurred')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:run -- EntryCard`
Expected: cannot find component.

- [ ] **Step 3: Implement `EntryCard.vue`**

Create `src/components/EntryCard.vue`:
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  entry: {
    id: string
    title: string
    content: string
    created_at: string
    share_code: string
    author: { username: string; avatar_url: string | null }
  }
  isAnchored: boolean
}>()

defineEmits<{
  'toggle-anchor': [entryId: string]
}>()

const revealed = ref(false)

const dateStr = computed(() => {
  const d = new Date(props.entry.created_at)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
})
const timeStr = computed(() => {
  const d = new Date(props.entry.created_at)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
})
</script>

<template>
  <article class="entry-card">
    <header class="entry-header">
      <div class="entry-header__left">
        <div class="avatar">
          <img v-if="entry.author.avatar_url" :src="entry.author.avatar_url" alt="" />
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <p class="username">{{ entry.author.username }}</p>
      </div>

      <h2 class="title">{{ entry.title }}</h2>

      <div class="entry-header__right">
        <p class="date">{{ dateStr }}</p>
        <p class="time">{{ timeStr }}</p>
      </div>
    </header>

    <div class="entry-body">
      <p>{{ entry.content }}</p>
    </div>

    <footer class="entry-footer">
      <button
        class="icon-btn"
        data-testid="reveal-toggle"
        :aria-label="revealed ? 'Hide share code' : 'Show share code'"
        @click="revealed = !revealed"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <template v-if="revealed">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </template>
          <template v-else>
            <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.61 19.61 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.61 19.61 0 0 1-3.17 4.19"/>
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </template>
        </svg>
      </button>

      <p class="share-code" :class="{ 'is-blurred': !revealed }" data-testid="share-code">
        {{ entry.share_code }}
      </p>

      <button
        class="icon-btn"
        data-testid="anchor-toggle"
        :aria-label="isAnchored ? 'Remove anchor' : 'Add anchor'"
        @click="$emit('toggle-anchor', entry.id)"
      >
        <svg viewBox="0 0 24 24" :fill="isAnchored ? 'currentColor' : 'none'"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             width="16" height="16">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    </footer>
  </article>
</template>

<style lang="scss" scoped>
.entry-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: $color-shadow-gray-2;
  border-radius: 10px;
  width: 100%;
  max-width: 800px;
  color: $color-text;
  font-family: $ibmpm;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
  width: 100%;
  gap: 1rem;

  &__left {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 7px;
    width: 115px;
  }
  &__right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: 10px;
    padding: 5px 0;
    width: 115px;
  }
}

.avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-iron-gray;
  border-radius: 24px;

  img { width: 100%; height: 100%; border-radius: inherit; object-fit: cover; }
  svg { width: 24px; height: 24px; color: $color-text; }
}

.username {
  font-family: $ibmpm;
  font-weight: 600;
  font-size: 20px;
  text-shadow: 0 0 4px rgba(255, 255, 255, 0.35);
  word-break: break-word;
}

.title {
  font-family: $oxanium;
  font-weight: 500;
  font-size: 24px;
  text-align: center;
  text-shadow: 0 0 3.5px white;
  margin: 0;
}

.date, .time {
  margin: 0;
  font-family: $ibmpm;
  font-size: 16px;
}
.date { text-shadow: 0 0 2.5px rgba(255, 255, 255, 0.35); }
.time { text-shadow: 0 0 4px rgba(242, 242, 242, 0.35); }

.entry-body {
  background: $color-gunmetal;
  border-radius: 5px;
  padding: 10px;
  width: 100%;

  p {
    margin: 0;
    font-family: $ibmpm;
    font-size: 16px;
    white-space: pre-wrap;
  }
}

.entry-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: $color-iron-gray;
  border-radius: 5px;
  height: 24px;
  padding: 0 5px;
  width: 100%;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: $color-text;
  cursor: pointer;
  padding: 3px;
  width: 24px;
  height: 24px;
}

.share-code {
  margin: 0;
  font-family: $ibmpm;
  font-size: 12px;
  transition: filter 150ms ease-in-out;

  &.is-blurred { filter: blur(2px); }
}

@media (max-width: 768px) {
  .entry-header {
    flex-wrap: wrap;
    justify-content: center;

    &__left, &__right { width: auto; }
    .title { order: -1; width: 100%; }
  }
}
</style>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:run -- EntryCard`
Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/EntryCard.vue src/components/EntryCard.test.ts
git commit -m "feat: add EntryCard component (1:1 from Figma)"
```

---

### Task 20: `EntryTabsNav` component

**Files:**
- Create: `src/components/EntryTabsNav.vue`

- [ ] **Step 1: Write the component**

```vue
<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="entry-tabs" aria-label="Entries tabs">
    <RouterLink to="/entries/shared" class="tab">Shared Entries</RouterLink>
    <RouterLink to="/entries/anchored" class="tab">Anchored Entries</RouterLink>
  </nav>
</template>

<style lang="scss" scoped>
.entry-tabs {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem 0;

  .tab {
    font-family: $oxanium;
    font-weight: 500;
    font-size: 20px;
    color: $color-iron-gray;
    text-decoration: none;
    padding: 0 1rem;
    transition: color 120ms ease;

    &:hover { color: $color-text; }

    &.router-link-active {
      color: $color-text;
      text-decoration: underline;
      text-underline-offset: 4px;
    }
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/EntryTabsNav.vue
git commit -m "feat: add EntryTabsNav (Shared / Anchored toggle)"
```

---

### Task 21: `TheEntries` parent view

**Files:**
- Create: `src/views/TheEntries.vue`

- [ ] **Step 1: Write the component**

```vue
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
  margin: 0 auto;
  padding: 0 100px;
  color: $color-text;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/views/TheEntries.vue
git commit -m "feat: add TheEntries shell with nested router-view"
```

---

### Task 22: `AnchoredEntries` view

**Files:**
- Create: `src/views/AnchoredEntries.vue`

- [ ] **Step 1: Write the component**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import EntryCard from '@/components/EntryCard.vue'
import { useAnchors } from '@/composables/useAnchors'

const { listAnchored, removeAnchor } = useAnchors()

interface AnchoredRow {
  id: string
  user_id: string
  title: string
  content: string
  mood: number | null
  share_code: string
  created_at: string
  author_username: string
  author_avatar_url: string | null
  anchored_at: string
}

const entries = ref<AnchoredRow[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  const { data, error: e } = await listAnchored()
  loading.value = false
  if (e) { error.value = e.message; return }
  entries.value = data ?? []
}

async function onUnanchor(entryId: string) {
  await removeAnchor(entryId)
  entries.value = entries.value.filter((e) => e.id !== entryId)
}

onMounted(load)
</script>

<template>
  <div class="anchored">
    <p class="subtitle">
      Entries that mean a lot to us and can be used as <span class="emphasis">emotional anchors.</span>
    </p>

    <p v-if="loading" class="state">Loading…</p>
    <p v-else-if="error" class="state error">{{ error }}</p>
    <p v-else-if="entries.length === 0" class="state">No anchored entries yet.</p>

    <ul v-else class="list">
      <li v-for="e in entries" :key="e.id">
        <EntryCard
          :entry="{
            id: e.id,
            title: e.title,
            content: e.content,
            created_at: e.created_at,
            share_code: e.share_code,
            author: { username: e.author_username, avatar_url: e.author_avatar_url },
          }"
          :is-anchored="true"
          @toggle-anchor="onUnanchor"
        />
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.anchored {
  font-family: $ibmpm;
  color: $color-text;
}
.subtitle {
  text-align: center;
  margin: 1rem 0 2rem;

  .emphasis {
    background: $color-iron-gray;
    padding: 0 0.4rem;
    border-radius: 3px;
  }
}
.state {
  text-align: center;
  margin: 2rem 0;
  &.error { color: #ff8080; }
}
.list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
```

- [ ] **Step 2: Verify in browser**

Run `npm run dev`. Visit `/entries/anchored`. Should show "No anchored entries yet." for a fresh user.

- [ ] **Step 3: Commit**

```bash
git add src/views/AnchoredEntries.vue
git commit -m "feat: add AnchoredEntries view"
```

---

### Task 23: TheNav ENTRIES link active

**Files:**
- Modify: `src/components/TheNav.vue`

- [ ] **Step 1: Wire the JOURNAL / ENTRIES / STATS links to real routes**

Find the existing nav links block (JOURNAL / ENTRIES / STATS). Convert each into a `<RouterLink>`:
```vue
<RouterLink to="/journal" class="nav-link">JOURNAL</RouterLink>
<RouterLink to="/entries" class="nav-link">ENTRIES</RouterLink>
<span class="nav-link is-disabled" aria-disabled="true">STATS</span>
```

(STATS has no route yet — render as an inert `<span>` styled to look the same but disabled. Replace with `<RouterLink>` when the Stats spec lands.)

Add to the scoped style:
```scss
.nav-link {
  color: $color-iron-gray;
  text-decoration: none;
  &:hover { color: $color-text; }
  &.router-link-active { color: $color-text; }
  &.is-disabled { opacity: 0.4; pointer-events: none; }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TheNav.vue
git commit -m "feat(nav): wire JOURNAL/ENTRIES links to router and active states"
```

---

### Task 24: Phase 2 manual verification

- [ ] **Step 1: Verify the anchored flow end-to-end**

Run `npm run dev`. Logged in:
1. Create a journal entry → row appears in `entries` table.
2. Open Supabase SQL editor and manually `insert into anchors (user_id, entry_id) values (auth.uid(), '<the entry id>');` (since we have no Anchored toggle UI yet on the journal page — that comes in Phase 3 via the Shared lookup, or could be added to the journal entry list in a future spec).
3. Visit `/entries/anchored` → the entry shows as a card.
4. Click the bookmark icon on the card → entry disappears from the list (unanchored).
5. Reload → list is empty.

- [ ] **Step 2: Fix any issues**

Phase 2 complete: real entries + anchored view works.

---

## Phase 3 — Shared Entries Lookup

### Task 25: `EntryShareSearch` component

**Files:**
- Create: `src/components/EntryShareSearch.vue`

- [ ] **Step 1: Write the component**

```vue
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

    &::placeholder {
      color: $color-iron-gray;
    }
    &:focus {
      outline: none;
      border-color: $color-text;
    }
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/EntryShareSearch.vue
git commit -m "feat: add EntryShareSearch component"
```

---

### Task 26: `SharedEntries` view

**Files:**
- Create: `src/views/SharedEntries.vue`

- [ ] **Step 1: Write the component**

```vue
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
    <p v-if="error" class="state error">{{ error }}</p>

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
.shared {
  font-family: $ibmpm;
  color: $color-text;
}
.state {
  text-align: center;
  margin: 2rem 0;
  &.error { color: #ff8080; }
}
.list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/views/SharedEntries.vue
git commit -m "feat: add SharedEntries view with session-list lookup"
```

---

### Task 27: Phase 3 manual verification

- [ ] **Step 1: Verify the full shared flow**

Run `npm run dev`. Logged in:
1. Open Supabase Table Editor → `entries` → copy a `share_code` value from any entry (your own or another test user's).
2. Visit `/entries/shared`. Paste the code, submit.
3. Card renders with correct author, title, body.
4. Click bookmark icon → row appears in `anchors` (verify in Supabase).
5. Visit `/entries/anchored` → that entry is listed.
6. Click bookmark again on the shared page → row removed from anchors.

- [ ] **Step 2: Cross-tab smoke test**

Tab nav active state: clicking each tab updates URL and `router-link-active` underline moves correctly.

---

## Final Step — Cleanup & Lint

### Task 28: Cleanup pass

- [ ] **Step 1: Run typecheck and build**

Run: `npm run build`
Expected: success, no TS errors.

- [ ] **Step 2: Run full test suite**

Run: `npm run test:run`
Expected: all tests pass.

- [ ] **Step 3: Remove any leftover unused files**

Check `src/` for any orphan files from refactoring. Common candidates: stale `src/router/main.ts` exports (`getView`), unused imports.

If `getView()` in `src/router/main.ts` is unused (it was a placeholder), delete it.

- [ ] **Step 4: Commit cleanup**

```bash
git add -A
git commit -m "chore: cleanup unused exports and verify build"
```

---

## Self-review notes

- **Spec coverage check:** All five spec sections (routing/structure, schema, auth flow, EntryCard, phasing) have at least one task. Stats view, profile edit, and global tab are explicitly out of scope per spec.
- **Stats nav link:** Wired as `is-disabled` (Task 23) so it doesn't 404 until that page exists in a separate spec.
- **Vue Router version:** Plan uses APIs (`createRouter`, `createWebHistory`, `RouterLink`, `useRouter`, `beforeEach`) that exist in both v4 and v5; if the installed `vue-router@^5.0.6` is unstable, executor can downgrade to v4 with no plan changes.
- **Manual user actions called out:** Supabase project creation, applying migrations, OAuth dashboard configuration, redirect URL configuration. All have written runbook in `supabase/README.md`.