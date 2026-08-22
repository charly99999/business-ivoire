import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Card, Tag } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useBusiness } from "@/lib/business-context";

const METRICS = [
  { label: "Vues", value: "1 284", trend: "+18 %", icon: "visibility", tint: "#0B6E8A" },
  { label: "Interactions", value: "216", trend: "+12 %", icon: "favorite-border", tint: "#E8752B" },
  { label: "Followers nets", value: "+48", trend: "+9 %", icon: "person-add-alt", tint: "#1D8A5B" },
  { label: "Revenus estimés", value: "0,00 $US", trend: "Gratuit", icon: "payments", tint: "#805AD5" },
];

export default function DashboardScreen() {
  const { posts, profile } = useBusiness();
  const latest = posts[0];
  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}><MaterialIcons name="arrow-back" size={25} color="#16202A" /></TouchableOpacity><Text style={styles.title}>Tableau de bord</Text><TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/settings" as never)}><MaterialIcons name="more-horiz" size={25} color="#16202A" /></TouchableOpacity></View>
        <Text style={styles.subtitle}>{profile.name} · Résultats de votre Page</Text>
        <Card style={styles.goalCard}><View style={styles.goalTop}><View style={styles.goalIcon}><MaterialIcons name="flag" size={22} color="#FFFFFF" /></View><View style={styles.goalCopy}><Text style={styles.goalEyebrow}>OBJECTIF HEBDOMADAIRE</Text><Text style={styles.goalTitle}>Obtenez 5 nouveaux followers</Text></View><Text style={styles.goalValue}>3/5</Text></View><View style={styles.progressTrack}><View style={styles.progressFill} /></View><Text style={styles.goalHint}>Encore 2 personnes à convaincre cette semaine.</Text></Card>
        <View style={styles.periods}><TouchableOpacity style={[styles.period, styles.periodActive]} activeOpacity={0.7}><Text style={[styles.periodText, styles.periodTextActive]}>28 jours</Text></TouchableOpacity><TouchableOpacity style={styles.period} activeOpacity={0.7}><Text style={styles.periodText}>7 jours</Text></TouchableOpacity><TouchableOpacity style={styles.period} activeOpacity={0.7}><Text style={styles.periodText}>Aujourd’hui</Text></TouchableOpacity></View>
        <Text style={styles.sectionTitle}>Performances</Text>
        <View style={styles.metricGrid}>{METRICS.map((metric) => <Card key={metric.label} style={styles.metricCard}><View style={[styles.metricIcon, { backgroundColor: `${metric.tint}1A` }]}><MaterialIcons name={metric.icon as never} size={21} color={metric.tint} /></View><Text style={styles.metricLabel}>{metric.label}</Text><Text style={styles.metricValue}>{metric.value}</Text><Text style={[styles.metricTrend, { color: metric.tint }]}>{metric.trend}</Text></Card>)}</View>
        <Card style={styles.chartCard}><View style={styles.chartHeader}><View><Text style={styles.chartTitle}>Vues du contenu</Text><Text style={styles.chartLabel}>28 derniers jours</Text></View><Text style={styles.chartTotal}>1 284</Text></View><View style={styles.chartBars}>{[38, 62, 45, 74, 54, 87, 69, 98, 78, 63, 92, 80].map((height, index) => <View key={index} style={styles.barColumn}><View style={[styles.bar, { height }]} /></View>)}</View><View style={styles.chartAxis}><Text>28 j.</Text><Text>14 j.</Text><Text>Aujourd’hui</Text></View></Card>
        <View style={styles.contentHeading}><Text style={styles.sectionTitle}>Dernière publication</Text><TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/create" as never)}><Text style={styles.link}>Créer</Text></TouchableOpacity></View>
        <Card style={styles.latestPost}><Tag label={latest.tag} tint="orange" /><Text style={styles.latestText} numberOfLines={3}>{latest.text}</Text><View style={styles.postMetricLine}><Text style={styles.postMetric}>{latest.reactions} réactions</Text><Text style={styles.postMetric}>{latest.comments} commentaires</Text><Text style={styles.postMetric}>326 vues</Text></View></Card>
        <Card style={styles.note}><MaterialIcons name="info-outline" size={22} color="#0B6E8A" /><Text style={styles.noteText}>Les chiffres affichés servent de démonstration locale. La collecte réelle nécessite un backend analytique et des règles de confidentialité.</Text></Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F7F5EF" },
  content: { padding: 16, paddingBottom: 32 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  title: { color: "#16202A", fontSize: 18, fontWeight: "900" },
  subtitle: { color: "#667085", fontSize: 12, fontWeight: "600", marginTop: 6 },
  goalCard: { marginTop: 18, padding: 15 },
  goalTop: { alignItems: "center", flexDirection: "row" },
  goalIcon: { alignItems: "center", backgroundColor: "#E8752B", borderRadius: 14, height: 42, justifyContent: "center", width: 42 },
  goalCopy: { flex: 1, marginLeft: 10 },
  goalEyebrow: { color: "#E8752B", fontSize: 10, fontWeight: "900", letterSpacing: 0.4 },
  goalTitle: { color: "#16202A", fontSize: 14, fontWeight: "900", marginTop: 2 },
  goalValue: { color: "#0B6E8A", fontSize: 18, fontWeight: "900" },
  progressTrack: { backgroundColor: "#E9E8E2", borderRadius: 5, height: 9, marginTop: 16, overflow: "hidden" },
  progressFill: { backgroundColor: "#1D8A5B", borderRadius: 5, height: 9, width: "60%" },
  goalHint: { color: "#667085", fontSize: 12, marginTop: 8 },
  periods: { backgroundColor: "#ECEAE4", borderRadius: 12, flexDirection: "row", marginTop: 20, padding: 3 },
  period: { alignItems: "center", borderRadius: 10, flex: 1, minHeight: 36, justifyContent: "center" },
  periodActive: { backgroundColor: "#FFFFFF" },
  periodText: { color: "#667085", fontSize: 12, fontWeight: "800" },
  periodTextActive: { color: "#0B6E8A" },
  sectionTitle: { color: "#16202A", fontSize: 18, fontWeight: "900", marginTop: 21 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 11 },
  metricCard: { minHeight: 143, padding: 12, width: "48.5%" },
  metricIcon: { alignItems: "center", borderRadius: 12, height: 36, justifyContent: "center", width: 36 },
  metricLabel: { color: "#667085", fontSize: 12, fontWeight: "700", marginTop: 11 },
  metricValue: { color: "#16202A", fontSize: 21, fontWeight: "900", marginTop: 3 },
  metricTrend: { fontSize: 11, fontWeight: "900", marginTop: 4 },
  chartCard: { marginTop: 12, padding: 15 },
  chartHeader: { flexDirection: "row", justifyContent: "space-between" },
  chartTitle: { color: "#16202A", fontSize: 15, fontWeight: "900" },
  chartLabel: { color: "#7A858F", fontSize: 12, marginTop: 3 },
  chartTotal: { color: "#0B6E8A", fontSize: 24, fontWeight: "900" },
  chartBars: { alignItems: "flex-end", flexDirection: "row", gap: 5, height: 112, marginTop: 18 },
  barColumn: { backgroundColor: "#E4F2F5", borderRadius: 5, flex: 1, height: 106, justifyContent: "flex-end", overflow: "hidden" },
  bar: { backgroundColor: "#0B6E8A", borderRadius: 5 },
  chartAxis: { flexDirection: "row", justifyContent: "space-between", marginTop: 7 },
  contentHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  link: { color: "#0B6E8A", fontSize: 13, fontWeight: "800", marginTop: 21 },
  latestPost: { gap: 9, marginTop: 11, padding: 14 },
  latestText: { color: "#29333D", fontSize: 14, lineHeight: 20 },
  postMetricLine: { flexDirection: "row", justifyContent: "space-between" },
  postMetric: { color: "#667085", fontSize: 11, fontWeight: "700" },
  note: { alignItems: "flex-start", flexDirection: "row", gap: 9, marginTop: 15, padding: 13 },
  noteText: { color: "#667085", flex: 1, fontSize: 12, lineHeight: 18 },
});
