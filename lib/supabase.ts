import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const configuredSupabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const configuredSupabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Static Expo Router rendering can run without Vercel runtime variables. Keep
// module evaluation safe, while all real requests still fail clearly when the
// deployment has not been configured with the public Supabase variables.
export const supabaseConfigured = Boolean(configuredSupabaseUrl && configuredSupabaseAnonKey);
export const supabaseUrl = configuredSupabaseUrl ?? "https://supabase-not-configured.invalid";
export const supabaseAnonKey = configuredSupabaseAnonKey ?? "eyJ_not_configured";

if (!supabaseConfigured && typeof window !== "undefined") {
  console.warn("La configuration Supabase Business Ivoire est absente de ce déploiement.");
}

const webStorage = {
  getItem: async (key: string) => (typeof window === "undefined" ? null : window.localStorage.getItem(key)),
  setItem: async (key: string, value: string) => { if (typeof window !== "undefined") window.localStorage.setItem(key, value); },
  removeItem: async (key: string) => { if (typeof window !== "undefined") window.localStorage.removeItem(key); },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === "web" ? webStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});
