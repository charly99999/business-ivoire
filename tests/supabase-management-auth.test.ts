import { describe, expect, it } from "vitest";

describe("autorisation d’administration Supabase", () => {
  const runManagementTest = process.env.RUN_SUPABASE_MANAGEMENT_TEST === "true";

  it.skipIf(!runManagementTest)("lit la configuration Auth du projet sans exposer le jeton", async () => {
    const token = process.env.SUPABASE_ACCESS_TOKEN;
    expect(token, "SUPABASE_ACCESS_TOKEN doit être fourni de façon sécurisée").toBeTruthy();

    const response = await fetch("https://api.supabase.com/v1/projects/ncobainibolvopwgmdzq/config/auth", {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status).toBe(200);
    const config = await response.json() as Record<string, unknown>;
    expect(config).toHaveProperty("mailer_autoconfirm");
  });
});
