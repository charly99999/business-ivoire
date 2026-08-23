import { describe, expect, it } from "vitest";

describe("adaptateur marketplace Supabase", () => {
  it("lit les annonces publiques avec vendeur et photos, sans dépendre de l’API MySQL", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("lib/supabase-marketplace.ts", "utf8"));

    expect(source).toContain('from("listings")');
    expect(source).toContain("listing_images");
    expect(source).toContain("profiles!listings_seller_id_fkey");
    expect(source).not.toContain("trpc");
  });
});
