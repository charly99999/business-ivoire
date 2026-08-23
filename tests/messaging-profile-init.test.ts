import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("messagerie Business Ivoire", () => {
  it("utilise la messagerie Supabase pour l’interface tout en conservant la protection historique de création", async () => {
    const database = await readFile("server/db.ts", "utf8");
    const inbox = await readFile("lib/supabase-business.ts", "utf8");
    const screen = await readFile("app/(tabs)/messages.tsx", "utf8");

    expect(database).toContain("await Promise.all([ensureProfile(userId), ensureProfile(targetUserId)])");
    expect(database).toContain("export async function sendMessage(userId: number, conversationId: number, body: string) {\n  await ensureProfile(userId);");
    expect(inbox).toContain('from("conversations")');
    expect(screen).not.toContain("trpc.");
  });
});
