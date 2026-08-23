import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("règles de médias Business Ivoire", () => {
  it("réserve le selfie à la caméra frontale sans sélecteur de galerie", async () => {
    const selfieScreen = await readFile("app/selfie.tsx", "utf8");

    expect(selfieScreen).toContain('facing="front"');
    expect(selfieScreen).toContain("takePictureAsync");
    expect(selfieScreen).toContain("setSelfie");
    expect(selfieScreen).toContain("Caméra frontale obligatoire");
    expect(selfieScreen).toContain("onPress={startCamera}");
    expect(selfieScreen).not.toContain("web-preview");
    expect(selfieScreen).not.toContain("expo-image-picker");
    expect(selfieScreen).not.toContain("launchCameraAsync");
    expect(selfieScreen).not.toContain("launchImageLibraryAsync");
  });

  it("autorise le choix de galerie seulement pour la couverture professionnelle", async () => {
    const profileScreen = await readFile("app/(tabs)/profile.tsx", "utf8");

    expect(profileScreen).toContain("expo-image-picker");
    expect(profileScreen).toContain("launchImageLibraryAsync");
    expect(profileScreen).toContain("setCover");
  });
});
