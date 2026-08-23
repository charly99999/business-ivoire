import { File } from "expo-file-system";
import { Platform } from "react-native";

function inferMime(uri: string, fallback = "image/jpeg") {
  const extension = uri.split("?")[0].split(".").pop()?.toLowerCase();
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return fallback;
}

export async function imageUriToDataUri(uri: string, mimeType?: string) {
  if (uri.startsWith("data:image/")) return uri;
  const mime = mimeType || inferMime(uri);
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Conversion d’image impossible."));
      reader.onerror = () => reject(new Error("Lecture d’image impossible."));
      reader.readAsDataURL(blob);
    });
  }
  const file = new File(uri);
  const base64 = await file.base64();
  return `data:${mime};base64,${base64}`;
}
