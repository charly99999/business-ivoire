import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Card, Tag } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

export default function DashboardScreen() {
  const dashboard = trpc.dashboard.mine.useQuery();
  const data = dashboard.data;
  const metrics = [
    { label: "Vues", value: data?.views.toLocaleString("fr-FR") ?? "—", trend: "Données réelles à venir", icon: "visibility", tint: "#0B6E8A" },
    { label: "Interactions", value: data?.interactions.toLocaleString("fr-FR") ?? "—", trend: "Réactions + commentaires", icon: "favorite-border", tint: "#E8752B" },
    { label: "Followers", value: data?.followers.toLocaleString("fr-FR") ?? "—", trend: "Abonnements actifs", icon: "person-add-alt", tint: "#1D8A5B" },
    { label: "Revenus estimés", value: "0,00 $US", trend: "Aucun paiement", icon: "payments", tint: "#805AD5" },
  ];
  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}><MaterialIcons name="arrow-back" size={25} color="#16202A" /></TouchableOpacity><Text style={styles.title}>Tableau de bord</Text><TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/settings" as never)}><MaterialIcons name="more-horiz" size={25} color="#16202A" /></TouchableOpacity></View>
        <Text style={styles.subtitle}>Résultats enregistrés pour votre Page</Text>
        <Card style={styles.goalCard}><View style={styles.goalTop}><View style={styles.goalIcon}><MaterialIcons name="flag" size={22} color="#FFFFFF" /></View><View style={styles.goalCopy}><Text style={styles.goalEyebrow}>OBJECTIF HEBDOMADAIRE</Text><Text style={styles.goalTitle}>Obtenez 5 nouveaux followers</Text></View><Text style={styles.goalValue}>{Math.min(data?.followers ?? 0, 5)}/5</Text></View><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, ((data?.followers ?? 0) / 5) * 100)}%` }]} /></View><Text style={styles.goalHint}>Les résultats sont calculés à partir des abonnements enregistrés.</Text></Card>
        <Text style={styles.sectionTitle}>Performances</Text>
        <View style={styles.metricGrid}>{metrics.map((metric) => <Card key={metric.label} style={styles.metricCard}><View style={[styles.metricIcon, { backgroundColor: `${metric.tint}1A` }]}><MaterialIcons name={metric.icon as never} size={21} color={metric.tint} /></View><Text style={styles.metricLabel}>{metric.label}</Text><Text style={styles.metricValue}>{metric.value}</Text><Text style={[styles.metricTrend, { color: metric.tint }]}>{metric.trend}</Text></Card>)}</View>
        <View style={styles.contentHeading}><Text style={styles.sectionTitle}>Dernière publication</Text><TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/create" as never)}><Text style={styles.link}>Créer</Text></TouchableOpacity></View>
        {data?.latestPost ? <Card style={styles.latestPost}><Tag label={data.latestPost.category} tint="orange" /><Text style={styles.latestText} numberOfLines={4}>{data.latestPost.body}</Text><Text style={styles.postMetric}>Les réactions et commentaires sont comptabilisés dans vos interactions.</Text></Card> : <Card style={styles.emptyCard}><MaterialIcons name="insights" size={30} color="#0B6E8A" /><Text style={styles.emptyTitle}>Votre tableau de bord démarre ici</Text><Text style={styles.emptyText}>Publiez une première opportunité pour suivre vos interactions et vos abonnements.</Text><TouchableOpacity activeOpacity={0.72} style={styles.emptyAction} onPress={() => router.push("/create" as never)}><Text style={styles.emptyActionText}>Créer une publication</Text></TouchableOpacity></Card>}
        <Card style={styles.note}><MaterialIcons name="info-outline" size={22} color="#0B6E8A" /><Text style={styles.noteText}>Business Ivoire reste gratuit : aucune fonctionnalité de paiement, publicité payante ou abonnement n’est activée.</Text></Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F7F5EF" }, content: { padding: 16, paddingBottom: 32 }, header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, title: { color: "#16202A", fontSize: 18, fontWeight: "900" }, subtitle: { color: "#667085", fontSize: 12, fontWeight: "600", marginTop: 6 }, goalCard: { marginTop: 18, padding: 15 }, goalTop: { alignItems: "center", flexDirection: "row" }, goalIcon: { alignItems: "center", backgroundColor: "#E8752B", borderRadius: 14, height: 42, justifyContent: "center", width: 42 }, goalCopy: { flex: 1, marginLeft: 10 }, goalEyebrow: { color: "#E8752B", fontSize: 10, fontWeight: "900", letterSpacing: 0.4 }, goalTitle: { color: "#16202A", fontSize: 14, fontWeight: "900", marginTop: 2 }, goalValue: { color: "#0B6E8A", fontSize: 18, fontWeight: "900" }, progressTrack: { backgroundColor: "#E9E8E2", borderRadius: 5, height: 9, marginTop: 16, overflow: "hidden" }, progressFill: { backgroundColor: "#1D8A5B", borderRadius: 5, height: 9 }, goalHint: { color: "#667085", fontSize: 12, marginTop: 8 }, sectionTitle: { color: "#16202A", fontSize: 18, fontWeight: "900", marginTop: 21 }, metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 11 }, metricCard: { minHeight: 143, padding: 12, width: "48.5%" }, metricIcon: { alignItems: "center", borderRadius: 12, height: 36, justifyContent: "center", width: 36 }, metricLabel: { color: "#667085", fontSize: 12, fontWeight: "700", marginTop: 11 }, metricValue: { color: "#16202A", fontSize: 21, fontWeight: "900", marginTop: 3 }, metricTrend: { fontSize: 10, fontWeight: "800", marginTop: 4 }, contentHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, link: { color: "#0B6E8A", fontSize: 13, fontWeight: "800", marginTop: 21 }, latestPost: { gap: 9, marginTop: 11, padding: 14 }, latestText: { color: "#29333D", fontSize: 14, lineHeight: 20 }, postMetric: { color: "#667085", fontSize: 12, lineHeight: 18 }, emptyCard: { alignItems: "flex-start", gap: 8, marginTop: 11, padding: 15 }, emptyTitle: { color: "#16202A", fontSize: 15, fontWeight: "900" }, emptyText: { color: "#667085", fontSize: 13, lineHeight: 19 }, emptyAction: { backgroundColor: "#E2F2F6", borderRadius: 10, marginTop: 3, paddingHorizontal: 12, paddingVertical: 9 }, emptyActionText: { color: "#0B6E8A", fontSize: 12, fontWeight: "900" }, note: { alignItems: "flex-start", flexDirection: "row", gap: 9, marginTop: 15, padding: 13 }, noteText: { color: "#667085", flex: 1, fontSize: 12, lineHeight: 18 },
});
