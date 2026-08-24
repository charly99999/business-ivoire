-- Boîte de réception efficace : une ligne par conversation avec son dernier message.
create or replace function public.get_my_conversation_inbox(p_limit integer default 50)
returns table (
  id uuid,
  title text,
  kind text,
  updated_at timestamptz,
  member_name text,
  member_avatar_path text,
  last_body text,
  last_created_at timestamptz
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    conversations.id,
    conversations.title,
    conversations.kind,
    conversations.updated_at,
    counterpart.display_name as member_name,
    counterpart.avatar_path as member_avatar_path,
    latest_message.body as last_body,
    latest_message.created_at as last_created_at
  from public.conversations
  join public.conversation_members mine
    on mine.conversation_id = conversations.id
   and mine.user_id = auth.uid()
  left join lateral (
    select profiles.display_name, profiles.avatar_path
    from public.conversation_members
    join public.profiles on profiles.id = conversation_members.user_id
    where conversation_members.conversation_id = conversations.id
      and conversation_members.user_id <> auth.uid()
    order by conversation_members.created_at asc
    limit 1
  ) counterpart on true
  left join lateral (
    select messages.body, messages.created_at
    from public.messages
    where messages.conversation_id = conversations.id
    order by messages.created_at desc
    limit 1
  ) latest_message on true
  order by coalesce(latest_message.created_at, conversations.updated_at) desc
  limit greatest(1, least(coalesce(p_limit, 50), 100));
$$;

grant execute on function public.get_my_conversation_inbox(integer) to authenticated;
