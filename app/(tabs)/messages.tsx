import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Avatar, Card } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useBusiness } from "@/lib/business-context";

export default function MessagesScreen() {
  const { conversations, refreshAll } = useBusiness();

  return (
    <ScreenContainer style={styles.screen}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => <TouchableOpacity activeOpacity={0.72} style={styles.conversation} onPress={() => router.push(`/conversation/${item.id}` as never)}><Avatar initials={item.name.slice(0, 2).toUpperCase()} uri={item.avatarUrl} size="lg" /><View style={styles.conversationCopy}><View style={styles.nameLine}><Text style={styles.name}>{item.name}</Text><Text style={styles.time}>{item.time ? new Date(item.time).toLocaleDateString("fr-CI", { day: "numeric", month: "short" }) : ""}</Text></View><Text numberOfLines={1} style={styles.preview}>{item.preview}</Text></View></TouchableOpacity>}
        refreshing={false}
        onRefresh={() => void refreshAll()}
        ListEmptyComponent={<Card style={styles.emptyConversation}><MaterialIcons name="forum" size={31} color="#176B35" /><Text style={styles.emptyTitle}>Aucune conversation</Text><Text style={styles.emptyText}>Depuis une annonce, choisissez « Contacter le vendeur » pour démarrer un échange sécurisé.</Text><TouchableOpacity onPress={() => router.push("/discover" as never)} style={styles.startButton}><Text style={styles.startText}>Voir les annonces</Text></TouchableOpacity></Card>}
        ListHeaderComponent={<View><View style={styles.header}><Text style={styles.title}>Messages</Text><TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/discover" as never)} style={styles.newMessage}><MaterialIcons name="storefront" size={21} color="#176B35" /></TouchableOpacity></View><Text style={styles.section}>Conversations sécurisées</Text></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F7F4EA" }, content: { paddingBottom: 24 }, header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 7 }, title: { color: "#102015", fontSize: 27, fontWeight: "900", letterSpacing: -0.6 }, newMessage: { alignItems: "center", backgroundColor: "#EDF5EB", borderRadius: 16, height: 44, justifyContent: "center", width: 44 }, section: { color: "#58675C", fontSize: 12, fontWeight: "800", letterSpacing: 0.4, marginBottom: 8, marginLeft: 16, marginTop: 23, textTransform: "uppercase" }, conversation: { alignItems: "center", backgroundColor: "#FFF", borderBottomColor: "#E7E4D8", borderBottomWidth: 1, flexDirection: "row", gap: 12, minHeight: 88, paddingHorizontal: 16 }, conversationCopy: { flex: 1, gap: 4 }, nameLine: { flexDirection: "row", justifyContent: "space-between" }, name: { color: "#102015", fontSize: 15, fontWeight: "800" }, time: { color: "#77847B", fontSize: 11, fontWeight: "600" }, preview: { color: "#647067", fontSize: 13 }, emptyConversation: { alignItems: "center", gap: 8, margin: 16, padding: 22 }, emptyTitle: { color: "#102015", fontSize: 16, fontWeight: "900" }, emptyText: { color: "#647067", fontSize: 12, lineHeight: 18, textAlign: "center" }, startButton: { backgroundColor: "#D5A72C", borderRadius: 10, marginTop: 6, paddingHorizontal: 12, paddingVertical: 9 }, startText: { color: "#102015", fontSize: 12, fontWeight: "900" },
});
