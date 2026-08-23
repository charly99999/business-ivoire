import { readFile, writeFile } from "node:fs/promises";

const query = await readFile("supabase/migrations/20260823_000003_social_feed_reference.sql", "utf8");
await writeFile(
  "supabase/inputs/social_feed_reference_migration.json",
  JSON.stringify({ project_id: "ncobainibolvopwgmdzq", name: "social_feed_reference", query }, null, 2),
);
