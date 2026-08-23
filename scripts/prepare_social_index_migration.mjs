import { readFile, writeFile } from "node:fs/promises";

const query = await readFile("supabase/migrations/20260823_000004_social_feed_index_hardening.sql", "utf8");
await writeFile(
  "supabase/inputs/social_feed_index_hardening_migration.json",
  JSON.stringify({ project_id: "ncobainibolvopwgmdzq", name: "social_feed_index_hardening", query }, null, 2),
);
