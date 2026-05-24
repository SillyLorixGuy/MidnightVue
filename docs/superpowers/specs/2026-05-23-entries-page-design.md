# Entries Page + Supabase Backend — Design Spec

**Date:** 2026-05-23
**Project:** MidnightVue
**Status:** Approved, ready for implementation plan

## Goal

Add the Entries page to MidnightVue with two sub-pages — **Shared Entries** (look up any user's entry by code) and **Anchored Entries** (a personal saved collection of entries that mean a lot to the user). Wire the app to Supabase for real persistence, including authentication, so journal entries become real data and can be shared and anchored.

## Scope

### In scope
- Two Entries sub-pages, 1:1 with Figma design (file `4iGXbBuyQe3I29M2YPZnNP`, frames `25:561` Shared and `25:653` Anchored).
- Supabase project setup, schema, RLS, two SECURITY DEFINER functions.
- Email/password auth + password reset flow + OAuth (Google, GitHub, Discord).
- Reusable `EntryCard` component matching Figma node `25:683`.
- Wiring the existing `TheJournal` submit to insert real entries.
- Extensible tab system (future "global" tab is one route away).

### Out of scope (separate specs)
- Profile edit view (pfp / username / bio editing).
- Stats view (the `STATS` nav link).
- Global entries tab.
- Mobile responsive polish of auth pages (functional only in this iteration).
- Email verification, magic-link login (password reset uses Supabase's recovery email; primary login stays password-based).

## Tab semantics

- **Shared Entries** — transient lookup. User pastes another user's share code; matching entry renders as a card. Multiple lookups append to a session-only list (resets on page reload).
- **Anchored Entries** — persistent. User's personal saved collection of entries (their own OR ones they've looked up via share code) that they've flagged as emotional anchors.
- **Global** (future) — placeholder in router; not built here.

## Entry card behavior

The footer row contains two icons + a blurred share code:
- **Eye-off icon (left)** — toggles a `revealed` state on the card; the share code's `filter: blur(2px)` becomes `blur(0)`. Icon swaps to `eye` (open) when revealed.
- **Share code (center)** — UUID, IBM Plex Mono Regular 12px, blurred by default. Click-to-copy on the revealed state is a nice-to-have, may defer.
- **Bookmark icon (right)** — toggles an `anchors` row for the (current user, this entry) pair. Filled when anchored, outlined when not.

The card is presentational: it emits `toggle-anchor` and the parent view calls `useAnchors`.

## Architecture

### Folder structure

```
src/
  views/
    TheJournal.vue            # moved from components/
    TheEntries.vue            # parent shell: tab nav + <router-view>
    SharedEntries.vue
    AnchoredEntries.vue
    AuthLogin.vue
    AuthSignup.vue
    AuthForgotPassword.vue
    AuthResetPassword.vue
  components/
    TheNav.vue
    TheFooter.vue
    EntryCard.vue             # the Figma card, reusable
    EntryShareSearch.vue      # search bar used in SharedEntries
    EntryTabsNav.vue          # "Shared Entries | Anchored Entries" toggle
  lib/
    supabase.ts               # client init
  composables/
    useAuth.ts
    useEntries.ts
    useAnchors.ts
  router/
    main.ts
supabase/
  migrations/
    0001_init.sql
```

### Routes

```
/                       redirect /journal
/journal                TheJournal           (requiresAuth)
/entries                redirect /entries/anchored
/entries/shared         SharedEntries        (requiresAuth)
/entries/anchored       AnchoredEntries      (requiresAuth)
/login                  AuthLogin
/signup                 AuthSignup
/forgot-password        AuthForgotPassword
/reset-password         AuthResetPassword    (entered via email recovery link)
```

A global `router.beforeEach` guard redirects unauthenticated users from `requiresAuth` routes to `/login`, and authenticated users from auth pages to `/journal`.

`TheEntries.vue` renders `EntryTabsNav` + `<router-view>`. Active styling is driven by `router-link-active`.

## Supabase schema

### Tables

**`profiles`** — extends Supabase `auth.users` (1:1 by id).
```sql
id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
username      text UNIQUE NOT NULL CHECK (username ~ '^[a-z0-9_]{3,20}$')
avatar_url    text
bio           text
created_at    timestamptz NOT NULL DEFAULT now()
```

**`entries`**
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
title         text NOT NULL
content       text NOT NULL
mood          smallint
share_code    uuid UNIQUE NOT NULL DEFAULT gen_random_uuid()
created_at    timestamptz NOT NULL DEFAULT now()
updated_at    timestamptz NOT NULL DEFAULT now()
```

**`anchors`**
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
entry_id      uuid NOT NULL REFERENCES entries(id) ON DELETE CASCADE
created_at    timestamptz NOT NULL DEFAULT now()
UNIQUE (user_id, entry_id)
```

### Row Level Security

All three tables have RLS enabled.

- **`profiles`**
  - `SELECT`: any authenticated user (entry cards need to show username/avatar of authors).
  - `UPDATE`: only `id = auth.uid()`.
  - `INSERT`: only `id = auth.uid()` (used at signup to seed the row).
- **`entries`**
  - `SELECT` / `INSERT` / `UPDATE` / `DELETE`: only where `user_id = auth.uid()`.
  - Cross-user reads (share code lookup, anchor feed) go through SECURITY DEFINER functions below.
- **`anchors`**
  - All operations restricted to `user_id = auth.uid()`.

### SECURITY DEFINER functions

**`get_entry_by_share_code(code uuid)`** — returns one row joining the entry and its author's public profile fields. Bypasses RLS but only ever returns the specific entry whose `share_code` matches.

**`get_my_anchored_entries()`** — returns the caller's anchored entries joined with author profile data, sorted by anchor creation desc. Bypasses RLS for the entries/profiles join but filters strictly to `anchors.user_id = auth.uid()`.

Both functions are `SECURITY DEFINER`, owned by the postgres role, with `EXECUTE` granted to `authenticated`.

## Auth flow

### Email/password
- **Signup** (`/signup`) — fields: email, password, username. Flow:
  1. `supabase.auth.signUp({ email, password })`.
  2. On success, `INSERT INTO profiles (id, username) VALUES (newUserId, username)`.
  3. Redirect to `/journal`.
- **Login** (`/login`) — email + password. `supabase.auth.signInWithPassword(...)`.
- **Forgot password** (`/forgot-password`) — email input. `supabase.auth.resetPasswordForEmail(email, { redirectTo: '<origin>/reset-password' })`. Shows "Check your inbox" confirmation.
- **Reset password** (`/reset-password`) — entered via the link in the recovery email (Supabase places the session in the URL hash). Two fields: new password + confirm password. Frontend validates they match, then `supabase.auth.updateUser({ password })`. Redirect to `/journal`.

### OAuth
- Google, GitHub, Discord. Enabled in the Supabase dashboard (manual configuration step — exact dashboard clicks listed in the implementation plan).
- Frontend buttons appear on `/login` and `/signup`, above the email/password form. Each calls `supabase.auth.signInWithOAuth({ provider, options: { redirectTo: '<origin>/journal' } })`.
- **First-time OAuth sign-in** has no username on the form. After the redirect, the app checks `profiles` for the current user id; if missing, inserts a row with an auto-generated username (`user_<6-char-hash-of-uid>`). Collisions are extremely unlikely given the entropy; in the rare case of a CHECK or UNIQUE violation, retry with a fresh suffix. User can rename later via the profile edit page (future spec).

### Session handling
- `useAuth.ts` composable wraps Supabase session state:
  - `session`, `user`, `profile` refs.
  - Populated from `supabase.auth.getSession()` on app boot, kept in sync via `supabase.auth.onAuthStateChange`.
  - Exposes `signUp`, `signIn`, `signOut`, `signInWithOAuth`, `requestPasswordReset`, `setNewPassword`, `isAuthenticated`.
  - Initialized once at app root.

### Nav integration
- The person icon in `TheNav` becomes a small dropdown:
  - Authenticated: shows username + "Sign out".
  - Unauthenticated: links to `/login`.
- "DAY DD.MM.YY" remains the current date display (unchanged).

## EntryCard visual spec (1:1 from Figma node `25:683`)

### Tokens used (already in `_variables.scss`)
- `$color-shadow-gray-2` (#2b2d35) — card background
- `$color-gunmetal` (#3a3c44) — entry body background
- `$color-iron-gray` (#46484f) — avatar + footer background
- `$color-text` (#f2f2f2) — all text
- `$ibmpm` — IBM Plex Mono
- `$oxanium` — Oxanium

### Wrapper
- `display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 10px`
- `background: $color-shadow-gray-2`
- `border-radius: 10px`
- `width: 100%` (max 800px in the parent)

### Header row
- `flex; justify-content: space-between; align-items: center; padding: 0 8px; width: 100%`
- **Left** (fixed 115px, flex 10px gap, 7px horizontal padding):
  - Avatar: 40×40 circle, `background: $color-iron-gray`, `border-radius: 24px`, 8px padding, 24px person icon. When `avatar_url` is set, render `<img>` instead.
  - Username: IBM Plex Mono **SemiBold 20px**, `color: $color-text`, `text-shadow: 0 0 4px rgba(255,255,255,0.35)`.
- **Center** — entry title: Oxanium Medium **24px**, `color: $color-text`, `text-shadow: 0 0 3.5px white`.
- **Right** (fixed 115px, flex column, right-aligned, 10px gap, 5px vertical padding):
  - Date: IBM Plex Mono Regular **16px**, format `D/M/YYYY`, `text-shadow: 0 0 2.5px rgba(255,255,255,0.35)`.
  - Time: IBM Plex Mono Regular **16px**, format `HH:MM`, `text-shadow: 0 0 4px rgba(242,242,242,0.35)`.

### Body
- `background: $color-gunmetal; padding: 10px; border-radius: 5px; width: 100%`
- IBM Plex Mono Regular 16px, `color: $color-text`, `white-space: pre-wrap`.

### Footer
- `background: $color-iron-gray; height: 24px; border-radius: 5px; padding: 0 5px; width: 100%`
- `flex; justify-content: space-between; align-items: center`
- **Left**: eye-off icon button, 24×24 hit area, 16×16 icon. Toggles `revealed`.
- **Center**: share code text, IBM Plex Mono Regular **12px**, `filter: blur(2px)` by default, transitions to `blur(0)` when revealed.
- **Right**: bookmark icon button, 16×16. Filled when anchored, outlined when not. Click emits `toggle-anchor`.

### Props / emits

```ts
defineProps<{
  entry: {
    id: string
    title: string
    content: string
    created_at: string         // ISO
    share_code: string
    author: { username: string; avatar_url: string | null }
  }
  isAnchored: boolean
}>()

defineEmits<{
  'toggle-anchor': [entryId: string]
}>()
```

### Responsive

Below `$bp-md`: header stacks (avatar+username top, title centered, date+time bottom). Mirrors the responsive approach already used in `TheJournal.vue`. Card stays readable down to mobile widths.

## Implementation phasing

Each phase ends with a working app — no half-wired states.

### Phase 1 — Supabase foundation + auth
- Install `@supabase/supabase-js`. Add `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` to `.env` and `.env.example`.
- `src/lib/supabase.ts` — client init.
- `supabase/migrations/0001_init.sql` — all tables, RLS, SECURITY DEFINER functions, username CHECK constraint.
- `useAuth.ts` composable.
- Auth views: `AuthLogin`, `AuthSignup`, `AuthForgotPassword`, `AuthResetPassword`. Functional styling (uses existing tokens), no Figma reference yet.
- Router: add auth routes + `requiresAuth` meta + `beforeEach` guard.
- `TheNav` person icon dropdown.
- OAuth provider configuration in Supabase dashboard (manual step, documented in plan).
- Frontend OAuth buttons on login/signup.
- Post-OAuth username auto-generation on first sign-in.

**End state:** can sign up, log in, log out, reset password, OAuth in. Journal UI unchanged.

### Phase 2 — Entries data + TheEntries shell + Anchored view
- Move `TheJournal.vue` from `components/` to `views/`. Update import in `App.vue`.
- `useEntries.ts` — `createEntry`, `listMyEntries`, `getByShareCode`.
- `useAnchors.ts` — `listAnchored`, `addAnchor`, `removeAnchor`, `isAnchored`.
- Wire `TheJournal` submit to `useEntries.createEntry`.
- `components/EntryCard.vue` — full 1:1 per spec above.
- `components/EntryTabsNav.vue` — Figma two-tab toggle.
- `views/TheEntries.vue` — tabs + `<router-view>`.
- `views/AnchoredEntries.vue` — subtitle + list of cards via `useAnchors.listAnchored`.
- Router: add `/entries` (redirect to `/entries/anchored`) + `/entries/anchored`.
- `TheNav` ENTRIES link active.

**End state:** create journal entries, anchor/unanchor from the Anchored tab.

### Phase 3 — Shared lookup view
- `components/EntryShareSearch.vue` — search bar from Figma.
- `views/SharedEntries.vue` — input + session-only `ref([])` list of looked-up cards.
- Router: add `/entries/shared`.
- Anchoring from a Shared card adds to `anchors` (entry stays owned by author).

**End state:** feature complete. Future "global" tab is one route + one view away.

## Open questions / deferred decisions

- Click-to-copy on revealed share code — nice-to-have, defer if it adds friction.
- Whether `/entries` defaults to `/anchored` (chosen) or `/shared` — can be flipped trivially later.
- Avatar upload UI lives in the future profile edit spec.