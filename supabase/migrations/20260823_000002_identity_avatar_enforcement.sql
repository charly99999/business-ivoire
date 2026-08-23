-- Avatar public dérivé du selfie privé, uniquement écrit par la fonction serveur.
alter table public.profiles add column if not exists avatar_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-avatars',
  'profile-avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists profile_avatars_public_read on storage.objects;
drop policy if exists profile_avatars_owner_upload on storage.objects;
drop policy if exists profile_avatars_owner_update on storage.objects;
drop policy if exists profile_avatars_owner_delete on storage.objects;

create policy profile_avatars_public_read
on storage.objects for select to public
using (bucket_id = 'profile-avatars');

create policy profile_avatars_owner_upload
on storage.objects for insert to authenticated
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy profile_avatars_owner_update
on storage.objects for update to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy profile_avatars_owner_delete
on storage.objects for delete to authenticated
using (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

-- Le client ne peut pas définir avatar_path : seule la fonction capture-selfie
-- dispose du rôle service pour écrire cet attribut sensible.
revoke update on table public.profiles from authenticated;
grant update (
  display_name,
  bio,
  category,
  location,
  phone,
  contact_email,
  cover_path,
  profile_locked
) on table public.profiles to authenticated;

-- Confirmation explicite du blocage RLS des nouvelles annonces sans selfie.
drop policy if exists listings_verified_seller_insert on public.listings;
create policy listings_verified_seller_insert
on public.listings for insert to authenticated
with check (
  seller_id = (select auth.uid())
  and exists (
    select 1
    from public.identity_verifications
    where profile_id = (select auth.uid())
      and status in ('selfie_captured', 'approved')
  )
);

-- Les fonctionnalités de messagerie sont également bloquées tant que
-- l’identité n’a pas enregistré un selfie direct.
drop policy if exists messages_member_send on public.messages;
create policy messages_member_send
on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1
    from public.conversation_members
    where conversation_id = messages.conversation_id
      and user_id = (select auth.uid())
  )
  and exists (
    select 1
    from public.identity_verifications
    where profile_id = (select auth.uid())
      and status in ('selfie_captured', 'approved')
  )
);

drop policy if exists conversations_authenticated_create on public.conversations;
create policy conversations_verified_user_create
on public.conversations for insert to authenticated
with check (
  exists (
    select 1
    from public.identity_verifications
    where profile_id = (select auth.uid())
      and status in ('selfie_captured', 'approved')
  )
);

drop policy if exists conversation_members_insert on public.conversation_members;
create policy conversation_members_verified_insert
on public.conversation_members for insert to authenticated
with check (
  exists (
    select 1
    from public.identity_verifications
    where profile_id = (select auth.uid())
      and status in ('selfie_captured', 'approved')
  )
  and (
    user_id = (select auth.uid())
    or exists (
      select 1
      from public.conversation_members cm
      where cm.conversation_id = conversation_members.conversation_id
        and cm.user_id = (select auth.uid())
    )
  )
);
