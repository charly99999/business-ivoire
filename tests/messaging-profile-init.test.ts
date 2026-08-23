import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("messagerie Business Ivoire", () => {
  it("initialise les profils avant une conversation et avant l’envoi d’un message", async () => {
    const database = await readFile("server/db.ts", "utf8");

    expect(database).toContain("await Promise.all([ensureProfile(userId), ensureProfile(targetUserId)])");
    expect(database).toContain("export async function sendMessage(userId: number, conversationId: number, body: string) {\n  await ensureProfile(userId);");
  });
});
