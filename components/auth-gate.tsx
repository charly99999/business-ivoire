import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ActivityIndicator, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { startOAuthLogin } from "@/constants/oauth";
import { ScreenContainer } from "@/components/screen-container";
import { useBusiness } from "@/lib/business-context";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { authenticated, authLoading, authError, retryAuth } = useBusiness();
  if (authLoading) {
    return <ScreenContainer style={styles.loading}><ActivityIndicator color="#0B6E8A" size="large" /><Text style={styles.loadingText}>Vérification de votre session…</Text></ScreenContainer>;
  }
  if (authenticated) return <>{children}</>;
  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}>
      <ImageBackground source={{ uri: "/manus-storage/business-ivoire-marketplace-banner_0b19a6cb.png" }} imageStyle={styles.backgroundImage} style={styles.hero}>
      <View style={styles.content}>
        <View style={styles.mark}><MaterialIcons name="business-center" size={35} color="#FFFFFF" /></View>
        <Text style={styles.eyebrow}>BUSINESS IVOIRE</Text><Text style={styles.title}>Achetez. Vendez. Grandissez.</Text>
        <Text style={styles.text}>La place de marché ivoirienne pour découvrir des opportunités, présenter votre activité et contacter les bons professionnels.</Text>
        <View style={styles.rule}><MaterialIcons name="verified-user" size={21} color="#D5A72C" /><Text style={styles.ruleText}>Gratuit, sécurisé et pensé pour les professionnels d’ici.</Text></View>
      </View>
      </ImageBackground>
      {authError ? <View style={styles.retryNotice}><Text style={styles.retryText}>La connexion est temporairement indisponible. Vous pouvez réessayer sans perdre vos informations.</Text><TouchableOpacity onPress={() => void retryAuth()}><Text style={styles.retryAction}>Réessayer</Text></TouchableOpacity></View> : null}
      <TouchableOpacity style={styles.button} activeOpacity={0.78} onPress={() => void startOAuthLogin()}><Text style={styles.buttonText}>Continuer vers Business Ivoire</Text><MaterialIcons name="arrow-forward" size={20} color="#102015" /></TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#07150B", padding: 20 }, hero: { borderRadius: 28, flex: 1, overflow: "hidden" }, backgroundImage: { opacity: 0.52 },
  content: { flex: 1, justifyContent: "center" },
  mark: { alignItems: "center", backgroundColor: "#176B35", borderColor: "#D5A72C", borderRadius: 25, borderWidth: 1, height: 58, justifyContent: "center", width: 58 }, eyebrow: { color: "#D5A72C", fontSize: 12, fontWeight: "900", letterSpacing: 2, marginTop: 22 },
  title: { color: "#FFFFFF", fontSize: 34, fontWeight: "900", letterSpacing: -1, lineHeight: 39, marginTop: 9 },
  text: { color: "#E7E9DF", fontSize: 15, lineHeight: 23, marginTop: 13 },
  rule: { alignItems: "flex-start", backgroundColor: "rgba(7,21,11,0.74)", borderColor: "rgba(213,167,44,0.6)", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 22, padding: 14 },
  ruleText: { color: "#F6F5E8", flex: 1, fontSize: 13, lineHeight: 19 },
  button: { alignItems: "center", backgroundColor: "#D5A72C", borderRadius: 16, flexDirection: "row", gap: 9, justifyContent: "center", marginTop: 14, minHeight: 54 },
  buttonText: { color: "#102015", fontSize: 15, fontWeight: "900" }, retryNotice: { alignItems: "center", backgroundColor: "#FFF3D3", borderRadius: 13, flexDirection: "row", gap: 10, justifyContent: "space-between", marginTop: 12, padding: 12 }, retryText: { color: "#704D04", flex: 1, fontSize: 12, lineHeight: 17 }, retryAction: { color: "#176B35", fontSize: 12, fontWeight: "900" },
  loading: { alignItems: "center", backgroundColor: "#F7F5EF", justifyContent: "center" },
  loadingText: { color: "#667085", fontSize: 14, fontWeight: "700", marginTop: 14 },
});
