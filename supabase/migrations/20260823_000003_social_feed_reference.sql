-- Flux social public inspiré de la référence Afrique Business V2,
-- conservant Business Ivoire comme marketplace sécurisé par identité.

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 3000),
  visibility text not null default 'public' check (visibility in ('public', 'followers')),
  status text not null default 'published' check (status in ('published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  storage_path text not null unique,
  media_type text not null default 'image' check (media_type = 'image'),
  sort_order integer not null default 0 check (sort_order between 0 and 7),
  created_at timestamptz not null default now(),
  unique (post_id, sort_order)
);

create table if not exists public.post_reactions (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction text not null default 'like' check (reaction in ('like', 'love', 'insightful')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_shares (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists posts_public_created_idx on public.posts (created_at desc) where status = 'published' and visibility = 'public';
create index if not exists post_media_post_id_idx on public.post_media (post_id, sort_order);
create index if not exists post_comments_post_created_idx on public.post_comments (post_id, created_at asc);
create index if not exists post_reactions_post_id_idx on public.post_reactions (post_id);
create index if not exists post_shares_post_id_idx on public.post_shares (post_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-media', 'post-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.post_reactions enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_shares enable row level security;

drop policy if exists posts_public_read on public.posts;
create policy posts_public_read on public.posts for select using (status = 'published' and visibility = 'public');
drop policy if exists posts_verified_author_insert on public.posts;
create policy posts_verified_author_insert on public.posts for insert to authenticated with check (
  author_id = (select auth.uid())
  and exists (select 1 from public.identity_verifications where profile_id = (select auth.uid()) and status in ('selfie_captured', 'approved'))
);
drop policy if exists posts_author_update on public.posts;
create policy posts_author_update on public.posts for update to authenticated using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
drop policy if exists posts_author_delete on public.posts;
create policy posts_author_delete on public.posts for delete to authenticated using (author_id = (select auth.uid()));

drop policy if exists post_media_public_read on public.post_media;
create policy post_media_public_read on public.post_media for select using (exists (select 1 from public.posts where posts.id = post_media.post_id and posts.status = 'published' and posts.visibility = 'public'));
drop policy if exists post_media_author_insert on public.post_media;
create policy post_media_author_insert on public.post_media for insert to authenticated with check (exists (select 1 from public.posts where posts.id = post_media.post_id and posts.author_id = (select auth.uid())));
drop policy if exists post_media_author_delete on public.post_media;
create policy post_media_author_delete on public.post_media for delete to authenticated using (exists (select 1 from public.posts where posts.id = post_media.post_id and posts.author_id = (select auth.uid())));

drop policy if exists post_reactions_public_read on public.post_reactions;
create policy post_reactions_public_read on public.post_reactions for select using (true);
drop policy if exists post_reactions_verified_insert on public.post_reactions;
create policy post_reactions_verified_insert on public.post_reactions for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.identity_verifications where profile_id = (select auth.uid()) and status in ('selfie_captured', 'approved')));
drop policy if exists post_reactions_own_update on public.post_reactions;
create policy post_reactions_own_update on public.post_reactions for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists post_reactions_own_delete on public.post_reactions;
create policy post_reactions_own_delete on public.post_reactions for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists post_comments_public_read on public.post_comments;
create policy post_comments_public_read on public.post_comments for select using (true);
drop policy if exists post_comments_verified_insert on public.post_comments;
create policy post_comments_verified_insert on public.post_comments for insert to authenticated with check (author_id = (select auth.uid()) and exists (select 1 from public.identity_verifications where profile_id = (select auth.uid()) and status in ('selfie_captured', 'approved')));
drop policy if exists post_comments_author_update on public.post_comments;
create policy post_comments_author_update on public.post_comments for update to authenticated using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
drop policy if exists post_comments_author_delete on public.post_comments;
create policy post_comments_author_delete on public.post_comments for delete to authenticated using (author_id = (select auth.uid()));

drop policy if exists post_shares_public_read on public.post_shares;
create policy post_shares_public_read on public.post_shares for select using (true);
drop policy if exists post_shares_verified_insert on public.post_shares;
create policy post_shares_verified_insert on public.post_shares for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.identity_verifications where profile_id = (select auth.uid()) and status in ('selfie_captured', 'approved')));
drop policy if exists post_shares_own_delete on public.post_shares;
create policy post_shares_own_delete on public.post_shares for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists post_media_public_storage_read on storage.objects;
create policy post_media_public_storage_read on storage.objects for select to public using (bucket_id = 'post-media');
drop policy if exists post_media_owner_storage_upload on storage.objects;
create policy post_media_owner_storage_upload on storage.objects for insert to authenticated with check (bucket_id = 'post-media' and (storage.foldername(name))[1] = (select auth.uid()::text));
drop policy if exists post_media_owner_storage_delete on storage.objects;
create policy post_media_owner_storage_delete on storage.objects for delete to authenticated using (bucket_id = 'post-media' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at before update on public.posts for each row execute function public.touch_updated_at();
drop trigger if exists post_comments_touch_updated_at on public.post_comments;
create trigger post_comments_touch_updated_at before update on public.post_comments for each row execute function public.touch_updated_at();
