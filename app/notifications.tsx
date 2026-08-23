import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";
import { relativeTime, useBusiness } from "@/lib/business-context";

const ICONS: Record<string, React.ComponentProps<typeof MaterialIcons>["name"]> = {
  reaction: "thumb-up",
  comment: "chat-bubble",
  follow: "person-add",
  message: "send",
  system: "info-outline",
};

export default function NotificationsScreen() {
  const { notifications, markNotificationRead } = useBusiness();
  return (
    <ScreenContainer style={styles.screen}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => {
          const actorName = item.actor?.displayName ?? "Business Ivoire";
          return <TouchableOpacity activeOpacity={0.72} onPress={() => void markNotificationRead(item.id)} style={[styles.item, !item.readAt && styles.unread]}><Avatar initials={actorName.slice(0, 2).toUpperCase()} color="#0B6E8A" /><View style={styles.copy}><Text style={styles.text}><Text style={styles.actor}>{actorName} </Text>{item.message}</Text><Text style={styles.time}>{relativeTime(item.createdAt)}</Text></View><View style={styles.icon}><MaterialIcons name={ICONS[item.kind] ?? "notifications"} size={13} color="#FFFFFF" /></View></TouchableOpacity>;
        }}
        ListEmptyComponent={<View style={styles.empty}><MaterialIcons name="notifications-none" size={42} color="#0B6E8A" /><Text style={styles.emptyTitle}>Aucune notification</Text><Text style={styles.emptyText}>Les réactions, commentaires et nouveaux messages apparaîtront ici.</Text></View>}
        ListHeaderComponent={<View style={styles.header}><TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}><MaterialIcons name="arrow-back" size={25} color="#16202A" /></TouchableOpacity><Text style={styles.title}>Notifications</Text><TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/profile" as never)}><Text style={styles.readAll}>Votre Page</Text></TouchableOpacity></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#FFFFFF" },
  content: { flexGrow: 1, paddingBottom: 20 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", padding: 16 },
  title: { color: "#16202A", fontSize: 18, fontWeight: "900" },
  readAll: { color: "#0B6E8A", fontSize: 13, fontWeight: "800" },
  item: { alignItems: "center", borderBottomColor: "#F0EFEB", borderBottomWidth: 1, flexDirection: "row", gap: 12, minHeight: 86, paddingHorizontal: 16, position: "relative" },
  unread: { backgroundColor: "#F2FAFC" },
  copy: { flex: 1 },
  text: { color: "#29333D", fontSize: 13, lineHeight: 19 },
  actor: { fontWeight: "900" },
  time: { color: "#0B6E8A", fontSize: 11, fontWeight: "700", marginTop: 4 },
  icon: { alignItems: "center", backgroundColor: "#0B6E8A", borderColor: "#FFFFFF", borderRadius: 10, borderWidth: 2, bottom: 13, height: 20, justifyContent: "center", left: 43, position: "absolute", width: 20 },
  empty: { alignItems: "center", paddingHorizontal: 38, paddingTop: 110 },
  emptyTitle: { color: "#16202A", fontSize: 17, fontWeight: "900", marginTop: 12 },
  emptyText: { color: "#667085", fontSize: 13, lineHeight: 19, marginTop: 6, textAlign: "center" },
});
