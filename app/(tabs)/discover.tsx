import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Avatar, Card, SectionTitle, Tag } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

const categories = [
  { id: "immo", label: "Immobilier", icon: "apartment", color: "#0B6E8A" },
  { id: "business", label: "Entrepreneuriat", icon: "trending-up", color: "#E8752B" },
  { id: "emploi", label: "Opportunité", icon: "work-outline", color: "#1D8A5B" },
  { id: "groupes", label: "Groupes", icon: "groups", color: "#805AD5" },
];

export default function DiscoverScreen() {
  const [search, setSearch] = useState("");
  const utils = trpc.useUtils();
  const peopleQuery = trpc.people.list.useQuery();
  const groupsQuery = trpc.groups.list.useQuery();
  const follow = trpc.people.toggleFollow.useMutation({ onSuccess: () => void utils.people.list.invalidate() });
  const membership = trpc.groups.toggleMembership.useMutation({ onSuccess: () => void utils.groups.list.invalidate() });
  const people = useMemo(() => (peopleQuery.data ?? []).filter((person) => `${person.displayName} ${person.category} ${person.location}`.toLowerCase().includes(search.toLowerCase())), [peopleQuery.data, search]);
  const groups = useMemo(() => (groupsQuery.data ?? []).filter((group) => `${group.name} ${group.category} ${group.location}`.toLowerCase().includes(search.toLowerCase())), [groupsQuery.data, search]);

  return (
    <ScreenContainer style={styles.screen}>
      <FlatList
        data={groups}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => <Card style={styles.groupCard}><Avatar initials={item.name.slice(0, 2).toUpperCase()} size="lg" color="#0B6E8A" /><View style={styles.groupCopy}><Text style={styles.groupTitle}>{item.name}</Text><Text style={styles.groupMembers}>{item.memberCount} membre{item.memberCount > 1 ? "s" : ""} · {item.location}</Text><Tag label={item.category} tint={item.category.includes("Entre") ? "orange" : "blue"} /></View><TouchableOpacity accessibilityLabel={`${item.joined ? "Quitter" : "Rejoindre"} ${item.name}`} style={[styles.joinButton, item.joined && styles.joinedButton]} activeOpacity={0.72} onPress={() => void membership.mutateAsync({ groupId: item.id })}><Text style={[styles.joinText, item.joined && styles.joinedText]}>{item.joined ? "Inscrit" : "Rejoindre"}</Text></TouchableOpacity></Card>}
        ListEmptyComponent={<Card style={styles.emptyGroups}><MaterialIcons name="groups" size={33} color="#0B6E8A" /><Text style={styles.emptyTitle}>Aucun groupe trouvé</Text><Text style={styles.emptyText}>Créez le premier espace dédié à votre secteur ou votre quartier.</Text><TouchableOpacity activeOpacity={0.72} onPress={() => router.push("/group-create" as never)} style={styles.emptyAction}><Text style={styles.emptyActionText}>Créer un groupe</Text></TouchableOpacity></Card>}
        ListHeaderComponent={<View><View style={styles.header}><Text style={styles.title}>Découvrir</Text><TouchableOpacity style={styles.filterButton} activeOpacity={0.7} onPress={() => router.push("/group-create" as never)}><MaterialIcons name="group-add" size={21} color="#0B6E8A" /></TouchableOpacity></View><View style={styles.searchBox}><MaterialIcons name="search" size={22} color="#667085" /><TextInput value={search} onChangeText={setSearch} placeholder="Rechercher un membre ou un groupe" placeholderTextColor="#7A858F" returnKeyType="search" style={styles.searchInput} /></View><SectionTitle title="Explorer par sujet" /><FlatList horizontal data={categories} keyExtractor={(item) => item.id} contentContainerStyle={styles.categoryList} showsHorizontalScrollIndicator={false} renderItem={({ item }) => <TouchableOpacity style={styles.category} activeOpacity={0.72} onPress={() => setSearch(item.label === "Groupes" ? "" : item.label)}><View style={[styles.categoryIcon, { backgroundColor: item.color }]}><MaterialIcons name={item.icon as never} size={23} color="#FFFFFF" /></View><Text style={styles.categoryText}>{item.label}</Text></TouchableOpacity>} /><SectionTitle title="Professionnels" action="Créer un groupe" onPress={() => router.push("/group-create" as never)} />{people.slice(0, 6).map((person, index) => <Card key={person.userId} style={styles.personCard}><Avatar initials={person.displayName.slice(0, 2).toUpperCase()} color={["#E8752B", "#1D8A5B", "#805AD5"][index % 3]} /><View style={styles.personCopy}><Text style={styles.personName}>{person.displayName}</Text><Text style={styles.personMeta}>{person.category} · {person.location}</Text></View><TouchableOpacity activeOpacity={0.72} disabled={follow.isPending} onPress={() => void follow.mutateAsync({ userId: person.userId })} style={styles.followButton}><Text style={styles.followText}>Suivre</Text></TouchableOpacity></Card>)}<SectionTitle title="Groupes à rejoindre" /></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F7F5EF" }, content: { gap: 12, padding: 14, paddingBottom: 30 }, header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 14 }, title: { color: "#16202A", fontSize: 27, fontWeight: "900", letterSpacing: -0.6 }, filterButton: { alignItems: "center", backgroundColor: "#E2F2F6", borderRadius: 16, height: 44, justifyContent: "center", width: 44 }, searchBox: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E7E5DE", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 8, marginBottom: 22, paddingHorizontal: 13 }, searchInput: { color: "#16202A", flex: 1, fontSize: 15, minHeight: 50 }, categoryList: { gap: 10, paddingBottom: 20 }, category: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E7E5DE", borderRadius: 16, borderWidth: 1, gap: 9, paddingHorizontal: 13, paddingVertical: 13, width: 118 }, categoryIcon: { alignItems: "center", borderRadius: 15, height: 45, justifyContent: "center", width: 45 }, categoryText: { color: "#29333D", fontSize: 12, fontWeight: "800", textAlign: "center" }, personCard: { alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 9, padding: 11 }, personCopy: { flex: 1 }, personName: { color: "#16202A", fontSize: 14, fontWeight: "900" }, personMeta: { color: "#667085", fontSize: 11, marginTop: 3 }, followButton: { backgroundColor: "#E2F2F6", borderRadius: 10, paddingHorizontal: 11, paddingVertical: 8 }, followText: { color: "#0B6E8A", fontSize: 12, fontWeight: "900" }, groupCard: { alignItems: "center", flexDirection: "row", gap: 11, padding: 13 }, groupCopy: { flex: 1, gap: 3 }, groupTitle: { color: "#16202A", fontSize: 15, fontWeight: "800" }, groupMembers: { color: "#667085", fontSize: 12, fontWeight: "600" }, joinButton: { backgroundColor: "#E2F2F6", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 9 }, joinedButton: { backgroundColor: "#DCF3E8" }, joinText: { color: "#0B6E8A", fontSize: 12, fontWeight: "800" }, joinedText: { color: "#16734C" }, emptyGroups: { alignItems: "center", gap: 7, padding: 20 }, emptyTitle: { color: "#16202A", fontSize: 15, fontWeight: "900" }, emptyText: { color: "#667085", fontSize: 12, lineHeight: 18, textAlign: "center" }, emptyAction: { backgroundColor: "#E2F2F6", borderRadius: 10, marginTop: 4, paddingHorizontal: 12, paddingVertical: 9 }, emptyActionText: { color: "#0B6E8A", fontSize: 12, fontWeight: "900" },
});
