-- Page de fil public optimisée : les compteurs sont agrégés côté base,
-- sans transférer la liste complète des réactions ni des commentaires.
create or replace function public.get_public_social_feed(
  p_cursor timestamptz default null,
  p_limit integer default 20
)
returns table (
  id uuid,
  author_id uuid,
  body text,
  created_at timestamptz,
  author_name text,
  author_category text,
  author_location text,
  author_avatar_path text,
  media_path text,
  reaction_count bigint,
  comment_count bigint,
  has_reacted boolean
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    posts.id,
    posts.author_id,
    posts.body,
    posts.created_at,
    profiles.display_name,
    profiles.category,
    profiles.location,
    profiles.avatar_path,
    (
      select post_media.storage_path
      from public.post_media
      where post_media.post_id = posts.id
      order by post_media.sort_order asc
      limit 1
    ) as media_path,
    (
      select count(*)
      from public.post_reactions
      where post_reactions.post_id = posts.id
    ) as reaction_count,
    (
      select count(*)
      from public.post_comments
      where post_comments.post_id = posts.id
    ) as comment_count,
    exists (
      select 1
      from public.post_reactions
      where post_reactions.post_id = posts.id
        and post_reactions.user_id = auth.uid()
    ) as has_reacted
  from public.posts
  join public.profiles on profiles.id = posts.author_id
  where posts.status = 'published'
    and posts.visibility = 'public'
    and (p_cursor is null or posts.created_at < p_cursor)
  order by posts.created_at desc
  limit greatest(1, least(coalesce(p_limit, 20), 50));
$$;

grant execute on function public.get_public_social_feed(timestamptz, integer) to anon, authenticated;
