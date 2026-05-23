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
