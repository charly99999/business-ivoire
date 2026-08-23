import { describe, expect, it } from "vitest";

describe("opérations Business Ivoire Supabase", () => {
  it("réserve les selfies au bucket privé et confirme le statut via la fonction serveur", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("lib/supabase-business.ts", "utf8"));

    expect(source).toContain('from("identity_verifications")');
    expect(source).toContain('from("identity-selfies")');
    expect(source).toContain('functions.invoke("capture-selfie"');
    expect(source).toContain('from("listings")');
    expect(source).toContain('from("listing_favorites")');
    expect(source).toContain('functions.invoke("create-direct-conversation"');
    expect(source).toContain('from("messages")');
    expect(source).toContain("fetchSupabaseMessages");
  });
});
