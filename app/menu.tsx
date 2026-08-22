import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Avatar, Card } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useBusiness } from "@/lib/business-context";

const shortcuts = [
  { label: "Tableau de bord professionnel", subtitle: "Suivez votre activité", icon: "insights", route: "/dashboard" },
  { label: "Enregistrements", subtitle: "Vos contenus gardés de côté", icon: "bookmark-border", route: "/discover" },
  { label: "Souvenirs", subtitle: "Retrouvez vos publications", icon: "history", route: "/profile" },
  { label: "Groupes", subtitle: "Vos communautés professionnelles", icon: "groups", route: "/discover" },
  { label: "Aide et assistance", subtitle: "Centre d’aide Business Ivoire", icon: "help-outline", route: "/settings" },
  { label: "Paramètres et confidentialité", subtitle: "Audience, Page et sécurité", icon: "settings", route: "/settings" },
];

export default function MenuScreen() {
  const { profile } = useBusiness();
  return (
    <ScreenContainer style={styles.screen}>
      <FlatList data={shortcuts} keyExtractor={(item) => item.label} contentContainerStyle={styles.content} renderItem={({ item }) => <Card style={styles.menuCard}><TouchableOpacity activeOpacity={0.72} onPress={() => router.push(item.route as never)} style={styles.menuRow}><View style={styles.iconWrap}><MaterialIcons name={item.icon as never} size={23} color="#0B6E8A" /></View><View style={styles.menuCopy}><Text style={styles.itemTitle}>{item.label}</Text><Text style={styles.itemSubtitle}>{item.subtitle}</Text></View><MaterialIcons name="chevron-right" size={23} color="#98A2B3" /></TouchableOpacity></Card>} ListHeaderComponent={<View><View style={styles.header}><TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}><MaterialIcons name="arrow-back" size={25} color="#16202A" /></TouchableOpacity><Text style={styles.title}>Menu</Text><View style={styles.headerSpace} /></View><TouchableOpacity activeOpacity={0.74} onPress={() => router.replace("/profile" as never)} style={styles.profileShortcut}><Avatar initials="BI" uri={profile.selfieUri} /><View><Text style={styles.profileName}>{profile.name}</Text><Text style={styles.profileSub}>Voir votre Page professionnelle</Text></View><MaterialIcons name="chevron-right" size={23} color="#667085" /></TouchableOpacity><Text style={styles.section}>Vos raccourcis</Text></View>} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F7F5EF" },
  content: { gap: 10, padding: 16, paddingBottom: 28 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  title: { color: "#16202A", fontSize: 19, fontWeight: "900" },
  headerSpace: { width: 25 },
  profileShortcut: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E7E5DE", borderRadius: 17, borderWidth: 1, flexDirection: "row", gap: 11, marginBottom: 22, padding: 13 },
  profileName: { color: "#16202A", fontSize: 15, fontWeight: "900" },
  profileSub: { color: "#667085", fontSize: 12, marginTop: 2 },
  section: { color: "#667085", fontSize: 12, fontWeight: "900", letterSpacing: 0.4, marginBottom: 2, textTransform: "uppercase" },
  menuCard: { overflow: "hidden" },
  menuRow: { alignItems: "center", flexDirection: "row", gap: 11, minHeight: 72, paddingHorizontal: 13 },
  iconWrap: { alignItems: "center", backgroundColor: "#E2F2F6", borderRadius: 14, height: 42, justifyContent: "center", width: 42 },
  menuCopy: { flex: 1 },
  itemTitle: { color: "#16202A", fontSize: 14, fontWeight: "900" },
  itemSubtitle: { color: "#667085", fontSize: 12, marginTop: 2 },
});
