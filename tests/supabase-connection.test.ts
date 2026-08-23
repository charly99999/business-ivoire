import { describe, expect, it } from "vitest";

describe("Supabase Business Ivoire", () => {
  it("expose une API publique joignable avec la clé anonyme configurée", async () => {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    expect(url).toMatch(/^https:\/\/[a-z0-9]+\.supabase\.co$/);
    expect(key).toMatch(/^eyJ/);

    const response = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
      headers: {
        apikey: key!,
        Authorization: `Bearer ${key!}`,
      },
    });

    expect(response.status).toBe(200);

    const listings = await fetch(`${url}/rest/v1/listings?select=id,title&limit=10`, {
      headers: {
        apikey: key!,
        Authorization: `Bearer ${key!}`,
      },
    });
    expect(listings.status).toBe(200);
  }, 20_000);
});
