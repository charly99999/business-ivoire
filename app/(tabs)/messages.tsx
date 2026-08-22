import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Avatar } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useBusiness } from "@/lib/business-context";

export default function MessagesScreen() {
  const { conversations } = useBusiness();
  return (
    <ScreenContainer style={styles.screen}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => <TouchableOpacity activeOpacity={0.72} style={styles.conversation} onPress={() => router.push(`/conversation/${item.id}` as never)}><Avatar initials={item.initials} size="lg" color={item.color} /><View style={styles.conversationCopy}><View style={styles.nameLine}><Text style={styles.name}>{item.name}</Text><Text style={styles.time}>{item.time}</Text></View><Text numberOfLines={1} style={[styles.preview, item.unread > 0 && styles.previewUnread]}>{item.preview}</Text></View>{item.unread > 0 ? <View style={styles.unread}><Text style={styles.unreadText}>{item.unread}</Text></View> : null}</TouchableOpacity>}
        ListHeaderComponent={<View><View style={styles.header}><Text style={styles.title}>Messages</Text><TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/create" as never)} style={styles.newMessage}><MaterialIcons name="edit" size={21} color="#0B6E8A" /></TouchableOpacity></View><View style={styles.searchBox}><MaterialIcons name="search" size={21} color="#667085" /><TextInput placeholder="Rechercher dans vos messages" placeholderTextColor="#7A858F" returnKeyType="search" style={styles.searchInput} /></View><Text style={styles.section}>Conversations récentes</Text></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#FFFFFF" },
  content: { paddingBottom: 24 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 7 },
  title: { color: "#16202A", fontSize: 27, fontWeight: "900", letterSpacing: -0.6 },
  newMessage: { alignItems: "center", backgroundColor: "#E2F2F6", borderRadius: 16, height: 44, justifyContent: "center", width: 44 },
  searchBox: { alignItems: "center", backgroundColor: "#F2F1EC", borderRadius: 14, flexDirection: "row", gap: 8, marginHorizontal: 16, marginTop: 16, paddingHorizontal: 12 },
  searchInput: { color: "#16202A", flex: 1, fontSize: 14, minHeight: 46 },
  section: { color: "#667085", fontSize: 12, fontWeight: "800", letterSpacing: 0.4, marginBottom: 4, marginLeft: 16, marginTop: 23, textTransform: "uppercase" },
  conversation: { alignItems: "center", borderBottomColor: "#F0EFEB", borderBottomWidth: 1, flexDirection: "row", gap: 12, minHeight: 88, paddingHorizontal: 16 },
  conversationCopy: { flex: 1, gap: 4 },
  nameLine: { flexDirection: "row", justifyContent: "space-between" },
  name: { color: "#16202A", fontSize: 15, fontWeight: "800" },
  time: { color: "#7A858F", fontSize: 11, fontWeight: "600" },
  preview: { color: "#667085", fontSize: 13 },
  previewUnread: { color: "#29333D", fontWeight: "700" },
  unread: { alignItems: "center", backgroundColor: "#E8752B", borderRadius: 12, height: 23, justifyContent: "center", minWidth: 23 },
  unreadText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
});
