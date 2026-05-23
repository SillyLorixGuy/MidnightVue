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
