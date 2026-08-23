-- Business Ivoire — schéma Supabase initial.
-- Les selfies restent privés ; une annonce publique exige un selfie capturé.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Utilisateur Business Ivoire',
  bio text,
  category text not null default 'Immobilier & Entrepreneuriat',
  location text not null default 'Abidjan, Côte d’Ivoire',
  phone text,
  contact_email text,
    cover_path text,
  profile_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 160),
  description text not null check (char_length(description) between 10 and 5000),
  price_fcfa bigint not null check (price_fcfa > 0),
  currency text not null default 'XOF' check (currency = 'XOF'),
  category text not null,
  location text not null,
  condition text not null default 'used' check (condition in ('new', 'used', 'service')),
  status text not null default 'active' check (status in ('active', 'sold', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_public_feed_idx on public.listings (status, created_at desc);
create index listings_seller_idx on public.listings (seller_id, created_at desc);
create index listings_category_idx on public.listings (category);

create table public.identity_verifications (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  selfie_path text,
  selfie_captured_at timestamptz,
  status text not null default 'pending'
    check (status in ('pending', 'selfie_captured', 'approved', 'rejected')),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  sort_order integer not null check (sort_order between 0 and 7),
  created_at timestamptz not null default now(),
  unique (listing_id, sort_order)
);

create table public.listing_favorites (
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (listing_id, user_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'direct' check (kind in ('direct', 'group')),
  title text,
  listing_id uuid references public.listings(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at asc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in ('message', 'favorite', 'system')),
  entity_id uuid,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger listings_set_updated_at before update on public.listings
for each row execute procedure public.set_updated_at();

create trigger conversations_set_updated_at before update on public.conversations
for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_business_ivoire_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, contact_email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, 'Utilisateur'), '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_business_ivoire
after insert on auth.users
for each row execute procedure public.handle_new_business_ivoire_user();

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.listing_favorites enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

grant select on public.profiles, public.listings, public.listing_images to anon, authenticated;
grant insert, update on public.profiles, public.listings, public.listing_images, public.listing_favorites, public.conversations, public.conversation_members, public.messages to authenticated;
grant select, update on public.listing_favorites, public.conversations, public.conversation_members, public.messages, public.notifications to authenticated;
revoke update on public.profiles from authenticated;
grant update (display_name, bio, category, location, phone, contact_email, cover_path, profile_locked) on public.profiles to authenticated;

create policy "profiles are visible without selfie path"
on public.profiles for select
using (true);

create policy "users update their own permitted profile fields"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "public reads verified active listings"
on public.listings for select
using (
  status = 'active'
  and exists (
    select 1 from public.profiles
    where profiles.id = listings.seller_id
      and profiles.identity_status in ('selfie_captured', 'approved')
  )
);

create policy "verified sellers create their own listings"
on public.listings for insert to authenticated
with check (
  seller_id = auth.uid()
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.identity_status in ('selfie_captured', 'approved')
  )
);

create policy "sellers update their own listings"
on public.listings for update to authenticated
using (seller_id = auth.uid())
with check (seller_id = auth.uid());

create policy "sellers delete their own listings"
on public.listings for delete to authenticated
using (seller_id = auth.uid());

create policy "listing images are public"
on public.listing_images for select using (true);

create policy "sellers add images to their own listings"
on public.listing_images for insert to authenticated
with check (
  exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id and listings.seller_id = auth.uid()
  )
);

create policy "sellers delete images from their own listings"
on public.listing_images for delete to authenticated
using (
  exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id and listings.seller_id = auth.uid()
  )
);

create policy "users manage their own favorites"
on public.listing_favorites for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "members read their conversations"
on public.conversations for select to authenticated
using (exists (select 1 from public.conversation_members where conversation_members.conversation_id = conversations.id and conversation_members.user_id = auth.uid()));

create policy "members read membership"
on public.conversation_members for select to authenticated
using (exists (select 1 from public.conversation_members mine where mine.conversation_id = conversation_members.conversation_id and mine.user_id = auth.uid()));

create policy "members read messages"
on public.messages for select to authenticated
using (exists (select 1 from public.conversation_members where conversation_members.conversation_id = messages.conversation_id and conversation_members.user_id = auth.uid()));

create policy "members send messages"
on public.messages for insert to authenticated
with check (
  sender_id = auth.uid()
  and exists (select 1 from public.conversation_members where conversation_members.conversation_id = messages.conversation_id and conversation_members.user_id = auth.uid())
);

create policy "users read own notifications"
on public.notifications for select to authenticated using (user_id = auth.uid());

create policy "users update own notifications"
on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values
  ('listing-media', 'listing-media', true),
  ('profile-covers', 'profile-covers', true),
  ('identity-selfies', 'identity-selfies', false)
on conflict (id) do nothing;

create policy "public listing media reads"
on storage.objects for select using (bucket_id = 'listing-media');

create policy "users upload their listing media"
on storage.objects for insert to authenticated
with check (bucket_id = 'listing-media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users manage their listing media"
on storage.objects for delete to authenticated
using (bucket_id = 'listing-media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "public cover reads"
on storage.objects for select using (bucket_id = 'profile-covers');

create policy "users upload their own covers"
on storage.objects for insert to authenticated
with check (bucket_id = 'profile-covers' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users manage their own covers"
on storage.objects for delete to authenticated
using (bucket_id = 'profile-covers' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users upload their own private selfies"
on storage.objects for insert to authenticated
with check (bucket_id = 'identity-selfies' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users read their own private selfies"
on storage.objects for select to authenticated
using (bucket_id = 'identity-selfies' and (storage.foldername(name))[1] = auth.uid()::text);
