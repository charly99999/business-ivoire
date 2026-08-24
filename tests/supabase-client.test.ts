import { describe, expect, it } from "vitest";

describe("client Supabase Business Ivoire", () => {
  it("utilise exclusivement les variables publiques Supabase nécessaires au client Expo", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("lib/supabase.ts", "utf8"));

    expect(source).toContain("EXPO_PUBLIC_SUPABASE_URL");
    expect(source).toContain("EXPO_PUBLIC_SUPABASE_ANON_KEY");
    expect(source).toContain("publicSupabaseUrl");
    expect(source).toContain("publicSupabaseAnonKey");
    expect(source).not.toContain("service_role");
    expect(source).not.toContain("sb_secret_");
  });
});
