-- Index couvrant les clés étrangères du flux social, après audit Supabase.
create index if not exists posts_author_created_idx on public.posts (author_id, created_at desc);
create index if not exists post_comments_author_id_idx on public.post_comments (author_id);
create index if not exists post_reactions_user_id_idx on public.post_reactions (user_id);
create index if not exists post_shares_user_id_idx on public.post_shares (user_id);
