import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Avatar } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";

const notifications = [
  { id: "n1", initials: "AK", color: "#E8752B", text: "Aïcha Koné a commenté votre publication sur les opportunités à Angré.", time: "Il y a 9 min", icon: "chat-bubble" },
  { id: "n2", initials: "IA", color: "#0B6E8A", text: "Le groupe Immobilier Abidjan a validé votre demande de participation.", time: "Il y a 42 min", icon: "groups" },
  { id: "n3", initials: "KT", color: "#1D8A5B", text: "Kader Traoré vous a mentionné dans une discussion professionnelle.", time: "Hier", icon: "alternate-email" },
  { id: "n4", initials: "BI", color: "#0B6E8A", text: "Votre Page a obtenu 3 nouveaux followers cette semaine.", time: "Hier", icon: "trending-up" },
];

export default function NotificationsScreen() {
  return (
    <ScreenContainer style={styles.screen}>
      <FlatList data={notifications} keyExtractor={(item) => item.id} contentContainerStyle={styles.content} renderItem={({ item, index }) => <TouchableOpacity activeOpacity={0.72} onPress={() => router.push((index === 1 ? "/discover" : "/profile") as never)} style={[styles.item, index < 2 && styles.unread]}><Avatar initials={item.initials} color={item.color} /><View style={styles.copy}><Text style={styles.text}>{item.text}</Text><Text style={styles.time}>{item.time}</Text></View><View style={[styles.icon, { backgroundColor: item.color }]}><MaterialIcons name={item.icon as never} size={13} color="#FFFFFF" /></View></TouchableOpacity>} ListHeaderComponent={<View style={styles.header}><TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}><MaterialIcons name="arrow-back" size={25} color="#16202A" /></TouchableOpacity><Text style={styles.title}>Notifications</Text><TouchableOpacity activeOpacity={0.7}><Text style={styles.readAll}>Tout lire</Text></TouchableOpacity></View>} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#FFFFFF" },
  content: { paddingBottom: 20 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", padding: 16 },
  title: { color: "#16202A", fontSize: 18, fontWeight: "900" },
  readAll: { color: "#0B6E8A", fontSize: 13, fontWeight: "800" },
  item: { alignItems: "center", borderBottomColor: "#F0EFEB", borderBottomWidth: 1, flexDirection: "row", gap: 12, minHeight: 86, paddingHorizontal: 16, position: "relative" },
  unread: { backgroundColor: "#F2FAFC" },
  copy: { flex: 1 },
  text: { color: "#29333D", fontSize: 13, lineHeight: 19 },
  time: { color: "#0B6E8A", fontSize: 11, fontWeight: "700", marginTop: 4 },
  icon: { alignItems: "center", borderColor: "#FFFFFF", borderRadius: 10, borderWidth: 2, bottom: 13, height: 20, justifyContent: "center", left: 43, position: "absolute", width: 20 },
});
