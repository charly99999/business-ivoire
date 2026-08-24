import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("parcours invité cohérent", () => {
  it("laisse les onglets publics accessibles et guide les actions privées vers l’accès", async () => {
    const [tabs, create, messages, profile, postCreate, conversation, listing] = await Promise.all([
      readFile("app/(tabs)/_layout.tsx", "utf8"),
      readFile("app/(tabs)/create.tsx", "utf8"),
      readFile("app/(tabs)/messages.tsx", "utf8"),
      readFile("app/(tabs)/profile.tsx", "utf8"),
      readFile("app/post/create.tsx", "utf8"),
      readFile("app/conversation/[id].tsx", "utf8"),
      readFile("app/listing/[id].tsx", "utf8"),
    ]);

    expect(tabs).not.toContain("<AuthGate>");
    [create, messages, profile, postCreate, conversation].forEach((screen) => expect(screen).toContain("AccessRequiredState"));
    expect(conversation).toContain("Message non envoyé");
    expect(listing).toContain("item.seller.selfieAvatarReady");
    expect(listing).not.toContain("const sellerVerified = true");
  });
});
