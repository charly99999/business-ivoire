import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Avatar, Card, SectionTitle, Tag } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";

const categories = [
  { id: "immo", label: "Immobilier", icon: "apartment", color: "#0B6E8A" },
  { id: "business", label: "Entrepreneuriat", icon: "trending-up", color: "#E8752B" },
  { id: "emploi", label: "Emploi", icon: "work-outline", color: "#1D8A5B" },
  { id: "groupes", label: "Groupes", icon: "groups", color: "#805AD5" },
];

const groups = [
  { id: "g1", title: "Immobilier Abidjan", members: "12,8 k membres", initials: "IA", color: "#0B6E8A", label: "Très actif" },
  { id: "g2", title: "Entrepreneurs de Côte d’Ivoire", members: "8,4 k membres", initials: "EC", color: "#E8752B", label: "Communauté" },
  { id: "g3", title: "Opportunités & Talents", members: "5,7 k membres", initials: "OT", color: "#1D8A5B", label: "Recrutement" },
];

export default function DiscoverScreen() {
  return (
    <ScreenContainer style={styles.screen}>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <Card style={styles.groupCard}>
            <Avatar initials={item.initials} size="lg" color={item.color} />
            <View style={styles.groupCopy}><Text style={styles.groupTitle}>{item.title}</Text><Text style={styles.groupMembers}>{item.members}</Text><Tag label={item.label} tint={item.id === "g2" ? "orange" : item.id === "g3" ? "green" : "blue"} /></View>
            <TouchableOpacity accessibilityLabel={`Rejoindre ${item.title}`} style={styles.joinButton} activeOpacity={0.72} onPress={() => router.push("/messages" as never)}><Text style={styles.joinText}>Rejoindre</Text></TouchableOpacity>
          </Card>
        )}
        ListHeaderComponent={
          <View>
            <View style={styles.header}><Text style={styles.title}>Découvrir</Text><TouchableOpacity style={styles.filterButton} activeOpacity={0.7}><MaterialIcons name="tune" size={21} color="#0B6E8A" /></TouchableOpacity></View>
            <View style={styles.searchBox}><MaterialIcons name="search" size={22} color="#667085" /><TextInput placeholder="Rechercher une opportunité" placeholderTextColor="#7A858F" returnKeyType="search" style={styles.searchInput} /></View>
            <SectionTitle title="Explorer par sujet" />
            <FlatList horizontal data={categories} keyExtractor={(item) => item.id} contentContainerStyle={styles.categoryList} showsHorizontalScrollIndicator={false} renderItem={({ item }) => <TouchableOpacity style={styles.category} activeOpacity={0.72} onPress={() => router.push("/create" as never)}><View style={[styles.categoryIcon, { backgroundColor: item.color }]}><MaterialIcons name={item.icon as never} size={23} color="#FFFFFF" /></View><Text style={styles.categoryText}>{item.label}</Text></TouchableOpacity>} />
            <SectionTitle title="Groupes à rejoindre" action="Voir tout" onPress={() => router.push("/menu" as never)} />
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F7F5EF" },
  content: { gap: 12, padding: 14, paddingBottom: 30 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  title: { color: "#16202A", fontSize: 27, fontWeight: "900", letterSpacing: -0.6 },
  filterButton: { alignItems: "center", backgroundColor: "#E2F2F6", borderRadius: 16, height: 44, justifyContent: "center", width: 44 },
  searchBox: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E7E5DE", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 8, marginBottom: 22, paddingHorizontal: 13 },
  searchInput: { color: "#16202A", flex: 1, fontSize: 15, minHeight: 50 },
  categoryList: { gap: 10, paddingBottom: 25 },
  category: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E7E5DE", borderRadius: 16, borderWidth: 1, gap: 9, paddingHorizontal: 13, paddingVertical: 13, width: 118 },
  categoryIcon: { alignItems: "center", borderRadius: 15, height: 45, justifyContent: "center", width: 45 },
  categoryText: { color: "#29333D", fontSize: 12, fontWeight: "800", textAlign: "center" },
  groupCard: { alignItems: "center", flexDirection: "row", gap: 11, padding: 13 },
  groupCopy: { flex: 1, gap: 3 },
  groupTitle: { color: "#16202A", fontSize: 15, fontWeight: "800" },
  groupMembers: { color: "#667085", fontSize: 12, fontWeight: "600" },
  joinButton: { backgroundColor: "#E2F2F6", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 9 },
  joinText: { color: "#0B6E8A", fontSize: 12, fontWeight: "800" },
});
