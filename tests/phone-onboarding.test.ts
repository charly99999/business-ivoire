import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("onboarding par téléphone", () => {
  it("demande les données professionnelles, vérifie un OTP et impose le selfie", async () => {
    const gate = await readFile("components/auth-gate.tsx", "utf8");
    const migration = await readFile("supabase/migrations/20260824_000005_phone_profile_onboarding.sql", "utf8");

    expect(gate).toContain("signInWithOtp");
    expect(gate).toContain('type: "sms"');
    expect(gate).toContain('router.replace("/selfie?required=1"');
    expect(gate).toContain('placeholder="Prénom"');
    expect(gate).toContain('placeholder="Nom"');
    expect(gate).toContain('placeholder="Ville"');
    expect(gate).not.toContain('placeholder="Adresse e-mail"');
    expect(gate).not.toContain('Mot de passe (10 caractères min.)');
    expect(migration).toContain("new.phone");
    expect(migration).toContain("first_name");
  });
});
