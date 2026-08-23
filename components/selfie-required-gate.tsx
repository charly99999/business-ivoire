import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useBusiness } from "@/lib/business-context";

export function SelfieRequiredGate({ children }: { children: React.ReactNode }) {
  const { authenticated, authLoading, error, identityReady, identityVerified, refreshAll } = useBusiness();
  const segments = useSegments();
  const onSelfieRoute = segments[0] === "selfie";
  const needsSelfie = authenticated && identityReady && !identityVerified;

  useEffect(() => {
    if (needsSelfie && !onSelfieRoute) {
      router.replace("/selfie?required=1" as never);
    }
  }, [needsSelfie, onSelfieRoute]);

  if (!authenticated || authLoading || !identityReady || onSelfieRoute) return <>{children}</>;
  if (error) {
    return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}><View style={styles.card}><MaterialIcons name="cloud-off" size={38} color="#D5A72C" /><Text style={styles.title}>Vérification indisponible</Text><Text style={styles.copy}>Votre statut d’identité n’a pas pu être chargé. Réessayez avant d’accéder aux fonctionnalités de Business Ivoire.</Text><TouchableOpacity onPress={() => void refreshAll()} style={styles.button}><Text style={styles.buttonText}>Réessayer</Text></TouchableOpacity></View></ScreenContainer>;
  }
  if (needsSelfie) {
    return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}><View style={styles.card}><ActivityIndicator size="large" color="#D5A72C" /><Text style={styles.title}>Selfie obligatoire</Text><Text style={styles.copy}>Ouverture sécurisée de la caméra frontale…</Text></View></ScreenContainer>;
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({ screen: { backgroundColor: "#07150B", justifyContent: "center", padding: 24 }, card: { alignItems: "center", backgroundColor: "#102015", borderColor: "#315438", borderRadius: 22, borderWidth: 1, gap: 12, padding: 24 }, title: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", textAlign: "center" }, copy: { color: "#DCE7DB", fontSize: 14, lineHeight: 21, textAlign: "center" }, button: { backgroundColor: "#D5A72C", borderRadius: 12, marginTop: 6, paddingHorizontal: 18, paddingVertical: 12 }, buttonText: { color: "#102015", fontWeight: "900" } });
