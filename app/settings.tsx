import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

import { Card } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";

const settings = [
  { icon: "public", title: "Audience et visibilité", description: "Gérez qui peut voir vos publications et votre Page." },
  { icon: "lock-outline", title: "Verrouillage du profil", description: "Limitez la visibilité de votre profil professionnel." },
  { icon: "business", title: "Détails de la Page", description: "Catégorie, horaires, contacts et localisation." },
  { icon: "verified-user", title: "Faire vérifier", description: "Consultez l’état de votre selfie de sécurité.", route: "/selfie" },
  { icon: "article", title: "Publications, stories et Reels", description: "Choisissez les règles de vos contenus." },
  { icon: "people-outline", title: "Followers et contenu public", description: "Réglez les interactions avec votre audience." },
];

export default function SettingsScreen() {
  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}><MaterialIcons name="arrow-back" size={25} color="#16202A" /></TouchableOpacity><Text style={styles.title}>Paramètres</Text><View style={styles.headerSpace} /></View>
        <Text style={styles.intro}>Paramètres et confidentialité</Text><Text style={styles.helper}>Choisissez comment votre Page professionnelle est visible et comment les personnes peuvent interagir avec vous.</Text>
        <Card style={styles.switchCard}><View style={styles.switchCopy}><Text style={styles.switchTitle}>Profil professionnel visible</Text><Text style={styles.switchText}>Votre Page apparaît dans la recherche et dans les groupes.</Text></View><Switch value trackColor={{ false: "#D0D5DD", true: "#0B6E8A" }} onValueChange={() => undefined} /></Card>
        <Text style={styles.section}>Gérer votre Page</Text>
        {settings.map((item) => <Card key={item.title} style={styles.itemCard}><TouchableOpacity activeOpacity={0.72} onPress={() => item.route ? router.push(item.route as never) : undefined} style={styles.item}><View style={styles.iconWrap}><MaterialIcons name={item.icon as never} size={22} color="#0B6E8A" /></View><View style={styles.itemCopy}><Text style={styles.itemTitle}>{item.title}</Text><Text style={styles.itemText}>{item.description}</Text></View><MaterialIcons name="chevron-right" size={23} color="#98A2B3" /></TouchableOpacity></Card>)}
        <Card style={styles.securityCard}><MaterialIcons name="info-outline" size={22} color="#E8752B" /><Text style={styles.securityText}>Cette version n’utilise aucun paiement, abonnement, publicité payante ni promotion monétisée.</Text></Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F7F5EF" },
  content: { padding: 16, paddingBottom: 34 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  title: { color: "#16202A", fontSize: 18, fontWeight: "900" },
  headerSpace: { width: 25 },
  intro: { color: "#16202A", fontSize: 25, fontWeight: "900", letterSpacing: -0.6, marginTop: 22 },
  helper: { color: "#667085", fontSize: 14, lineHeight: 20, marginTop: 8 },
  switchCard: { alignItems: "center", flexDirection: "row", gap: 12, marginTop: 17, padding: 14 },
  switchCopy: { flex: 1 },
  switchTitle: { color: "#16202A", fontSize: 14, fontWeight: "900" },
  switchText: { color: "#667085", fontSize: 12, lineHeight: 17, marginTop: 3 },
  section: { color: "#667085", fontSize: 12, fontWeight: "900", letterSpacing: 0.4, marginBottom: 9, marginTop: 23, textTransform: "uppercase" },
  itemCard: { marginBottom: 9, overflow: "hidden" },
  item: { alignItems: "center", flexDirection: "row", gap: 11, minHeight: 77, paddingHorizontal: 13 },
  iconWrap: { alignItems: "center", backgroundColor: "#E2F2F6", borderRadius: 14, height: 43, justifyContent: "center", width: 43 },
  itemCopy: { flex: 1 },
  itemTitle: { color: "#16202A", fontSize: 14, fontWeight: "900" },
  itemText: { color: "#667085", fontSize: 12, lineHeight: 17, marginTop: 2 },
  securityCard: { alignItems: "flex-start", flexDirection: "row", gap: 9, marginTop: 12, padding: 13 },
  securityText: { color: "#667085", flex: 1, fontSize: 12, lineHeight: 18 },
});
