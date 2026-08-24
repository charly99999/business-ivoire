import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

// Ces deux valeurs sont publiques par conception dans un client Supabase : les
// autorisations réelles restent imposées par les policies RLS. Les valeurs de
// secours permettent aussi à l’export web Vercel de se compiler lorsqu’il ne
// reçoit pas encore les variables EXPO_PUBLIC_* du tableau de bord.
const publicSupabaseUrl = "https://ncobainibolvopwgmdzq.supabase.co";
const publicSupabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jb2JhaW5pYm9sdm9wd2dtZHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTAyNTMsImV4cCI6MjEwMzA2NjI1M30.8xmS3RSnaJIZ7aM-qsiiWPF9N6x4FIY2AHgMsir4ywg";

export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? publicSupabaseUrl;
export const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? publicSupabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("La configuration Supabase Business Ivoire est incomplète.");
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
