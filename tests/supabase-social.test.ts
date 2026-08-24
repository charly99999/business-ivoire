import { describe, expect, it } from "vitest";

describe("fil social Supabase", () => {
  it("utilise des publications, médias, réactions, commentaires et vérification d’identité réels", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("lib/supabase-social.ts", "utf8"));
    const migration = await import("node:fs/promises").then((fs) => fs.readFile("supabase/migrations/20260823_000003_social_feed_reference.sql", "utf8"));

    expect(source).toContain('from("posts")');
    expect(source).toContain('from("post_media")');
    expect(source).toContain('from("post_reactions")');
    expect(source).toContain('from("post_comments")');
    expect(source).toContain('from("post_shares")');
    expect(source).toContain('from("identity_verifications")');
    expect(source).toContain('rpc("get_public_social_feed"');
    expect(source).toContain('from("post-media").upload');
    expect(migration).toContain("create table if not exists public.posts");
    expect(migration).toContain("create table if not exists public.post_comments");
    expect(migration).toContain("create table if not exists public.post_reactions");
    expect(migration).toContain("post_media");
    expect(migration).toContain("post_comments_verified_insert");
    expect(migration).toContain("posts_verified_author_insert");
    const scalingMigration = await import("node:fs/promises").then((fs) => fs.readFile("supabase/migrations/20260824_000006_social_feed_scaling.sql", "utf8"));
    expect(scalingMigration).toContain("get_public_social_feed");
  });
});
