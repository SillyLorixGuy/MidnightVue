-- =========================================
-- 0002_profile_rpc.sql
-- Profile RPCs + avatars storage bucket
-- =========================================

-- ---------- get_my_profile ----------

create or replace function public.get_my_profile()
returns table (
  username        text,
  bio             text,
  avatar_url      text,
  created_at      timestamptz,
  last_sign_in_at timestamptz,
  total_entries   integer
)
language sql
security definer
set search_path = public
as $$
  select
    p.username,
    p.bio,
    p.avatar_url,
    p.created_at,
    coalesce(u.last_sign_in_at, p.created_at) as last_sign_in_at,
    (select count(*)::int from public.entries e where e.user_id = p.id) as total_entries
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id = auth.uid();
$$;

grant execute on function public.get_my_profile() to authenticated;

-- ---------- update_my_profile ----------

create or replace function public.update_my_profile(
  p_username   text,
  p_bio        text,
  p_avatar_url text
) returns void
language sql
security invoker
set search_path = public
as $$
  update public.profiles
     set username   = p_username,
         bio        = p_bio,
         avatar_url = p_avatar_url
   where id = auth.uid();
$$;

grant execute on function public.update_my_profile(text, text, text) to authenticated;

-- ---------- avatars bucket ----------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars: owner write"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: owner update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: owner delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: public read"
  on storage.objects for select to public
  using (bucket_id = 'avatars');
