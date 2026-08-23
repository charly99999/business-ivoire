import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { startOAuthLogin } from "@/constants/oauth";
import { ScreenContainer } from "@/components/screen-container";
import { useBusiness } from "@/lib/business-context";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { authenticated, authLoading } = useBusiness();
  if (authLoading) {
    return <ScreenContainer style={styles.loading}><ActivityIndicator color="#0B6E8A" size="large" /><Text style={styles.loadingText}>Vérification de votre session…</Text></ScreenContainer>;
  }
  if (authenticated) return <>{children}</>;
  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.mark}><MaterialIcons name="business-center" size={35} color="#FFFFFF" /></View>
        <Text style={styles.title}>Rejoignez Business Ivoire</Text>
        <Text style={styles.text}>Connectez-vous pour publier, contacter les professionnels, gérer votre Page et conserver vos informations de manière sécurisée.</Text>
        <View style={styles.rule}><MaterialIcons name="verified-user" size={21} color="#0B6E8A" /><Text style={styles.ruleText}>Un selfie pris en direct sera demandé avant d’activer votre profil public.</Text></View>
      </View>
      <TouchableOpacity style={styles.button} activeOpacity={0.78} onPress={() => void startOAuthLogin()}><Text style={styles.buttonText}>Se connecter pour continuer</Text><MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" /></TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F7F5EF", padding: 24 },
  content: { flex: 1, justifyContent: "center" },
  mark: { alignItems: "center", backgroundColor: "#0B6E8A", borderRadius: 25, height: 58, justifyContent: "center", width: 58 },
  title: { color: "#16202A", fontSize: 30, fontWeight: "900", letterSpacing: -0.7, lineHeight: 37, marginTop: 22 },
  text: { color: "#475467", fontSize: 15, lineHeight: 23, marginTop: 13 },
  rule: { alignItems: "flex-start", backgroundColor: "#FFFFFF", borderColor: "#E7E5DE", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 22, padding: 14 },
  ruleText: { color: "#475467", flex: 1, fontSize: 13, lineHeight: 19 },
  button: { alignItems: "center", backgroundColor: "#0B6E8A", borderRadius: 16, flexDirection: "row", gap: 9, justifyContent: "center", minHeight: 54 },
  buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  loading: { alignItems: "center", backgroundColor: "#F7F5EF", justifyContent: "center" },
  loadingText: { color: "#667085", fontSize: 14, fontWeight: "700", marginTop: 14 },
});
