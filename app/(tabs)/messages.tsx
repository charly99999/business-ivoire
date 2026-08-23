import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Avatar, Card } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useBusiness } from "@/lib/business-context";
import { trpc } from "@/lib/trpc";

export default function MessagesScreen() {
  const { conversations } = useBusiness();
  const utils = trpc.useUtils();
  const people = trpc.people.list.useQuery();
  const createDirect = trpc.conversations.createDirect.useMutation({ onSuccess: () => void utils.conversations.list.invalidate() });

  const openConversation = async (userId: number) => {
    try {
      const created = await createDirect.mutateAsync({ userId });
      router.push(`/conversation/${created.id}` as never);
    } catch {
      // The user receives the state through the available contact list; no sensitive detail is exposed.
    }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => <TouchableOpacity activeOpacity={0.72} style={styles.conversation} onPress={() => router.push(`/conversation/${item.id}` as never)}><Avatar initials={item.initials} size="lg" color={item.color} /><View style={styles.conversationCopy}><View style={styles.nameLine}><Text style={styles.name}>{item.name}</Text><Text style={styles.time}>{item.time}</Text></View><Text numberOfLines={1} style={styles.preview}>{item.preview}</Text></View></TouchableOpacity>}
        ListEmptyComponent={<Card style={styles.emptyConversation}><MaterialIcons name="forum" size={31} color="#0B6E8A" /><Text style={styles.emptyTitle}>Aucune conversation</Text><Text style={styles.emptyText}>Sélectionnez un membre ci-dessous pour démarrer un échange professionnel.</Text></Card>}
        ListHeaderComponent={<View><View style={styles.header}><Text style={styles.title}>Messages</Text><TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/discover" as never)} style={styles.newMessage}><MaterialIcons name="person-search" size={21} color="#0B6E8A" /></TouchableOpacity></View><View style={styles.searchBox}><MaterialIcons name="search" size={21} color="#667085" /><TextInput placeholder="Rechercher dans vos messages" placeholderTextColor="#7A858F" returnKeyType="search" style={styles.searchInput} /></View><Text style={styles.section}>Conversations récentes</Text></View>}
        ListFooterComponent={<View style={styles.peopleSection}><Text style={styles.section}>Membres disponibles</Text>{(people.data ?? []).map((person, index) => <Card key={person.userId} style={styles.personCard}><Avatar initials={person.displayName.slice(0, 2).toUpperCase()} color={["#0B6E8A", "#E8752B", "#1D8A5B"][index % 3]} /><View style={styles.personCopy}><Text style={styles.personName}>{person.displayName}</Text><Text style={styles.personMeta}>{person.category} · {person.location}</Text></View><TouchableOpacity activeOpacity={0.72} disabled={createDirect.isPending} onPress={() => void openConversation(person.userId)} style={styles.startButton}><Text style={styles.startText}>Écrire</Text></TouchableOpacity></Card>)}</View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#FFFFFF" }, content: { paddingBottom: 24 }, header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 7 }, title: { color: "#16202A", fontSize: 27, fontWeight: "900", letterSpacing: -0.6 }, newMessage: { alignItems: "center", backgroundColor: "#E2F2F6", borderRadius: 16, height: 44, justifyContent: "center", width: 44 }, searchBox: { alignItems: "center", backgroundColor: "#F2F1EC", borderRadius: 14, flexDirection: "row", gap: 8, marginHorizontal: 16, marginTop: 16, paddingHorizontal: 12 }, searchInput: { color: "#16202A", flex: 1, fontSize: 14, minHeight: 46 }, section: { color: "#667085", fontSize: 12, fontWeight: "800", letterSpacing: 0.4, marginBottom: 8, marginLeft: 16, marginTop: 23, textTransform: "uppercase" }, conversation: { alignItems: "center", borderBottomColor: "#F0EFEB", borderBottomWidth: 1, flexDirection: "row", gap: 12, minHeight: 88, paddingHorizontal: 16 }, conversationCopy: { flex: 1, gap: 4 }, nameLine: { flexDirection: "row", justifyContent: "space-between" }, name: { color: "#16202A", fontSize: 15, fontWeight: "800" }, time: { color: "#7A858F", fontSize: 11, fontWeight: "600" }, preview: { color: "#667085", fontSize: 13 }, emptyConversation: { alignItems: "center", gap: 6, margin: 16, padding: 18 }, emptyTitle: { color: "#16202A", fontSize: 15, fontWeight: "900" }, emptyText: { color: "#667085", fontSize: 12, lineHeight: 18, textAlign: "center" }, peopleSection: { paddingBottom: 20 }, personCard: { alignItems: "center", flexDirection: "row", gap: 10, marginHorizontal: 16, marginTop: 8, padding: 11 }, personCopy: { flex: 1 }, personName: { color: "#16202A", fontSize: 14, fontWeight: "900" }, personMeta: { color: "#667085", fontSize: 11, marginTop: 3 }, startButton: { backgroundColor: "#E2F2F6", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }, startText: { color: "#0B6E8A", fontSize: 12, fontWeight: "900" },
});
