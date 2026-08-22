import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Avatar } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useBusiness } from "@/lib/business-context";

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { conversations, sendMessage } = useBusiness();
  const conversation = conversations.find((item) => item.id === id) ?? conversations[0];
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<string[]>([]);

  const send = () => {
    const clean = draft.trim();
    if (!clean) return;
    sendMessage(conversation.id, clean);
    setSent((current) => [...current, clean]);
    setDraft("");
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.screen}>
        <View style={styles.header}><TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}><MaterialIcons name="arrow-back" size={25} color="#16202A" /></TouchableOpacity><View style={styles.contact}><Avatar initials={conversation.initials} size="sm" color={conversation.color} /><View><Text style={styles.name}>{conversation.name}</Text><Text style={styles.status}>Actif maintenant</Text></View></View><TouchableOpacity activeOpacity={0.7}><MaterialIcons name="info-outline" size={23} color="#0B6E8A" /></TouchableOpacity></View>
        <View style={styles.messages}><View style={styles.dayLabel}><Text style={styles.dayText}>Aujourd’hui</Text></View><View style={styles.received}><Text style={styles.receivedText}>Bonjour, je vous écris depuis Business Ivoire. Comment pouvons-nous avancer ensemble ?</Text></View><View style={styles.sent}><Text style={styles.sentText}>Bonjour, merci pour votre message.</Text></View>{sent.map((message, index) => <View key={`${message}-${index}`} style={styles.sent}><Text style={styles.sentText}>{message}</Text></View>)}</View>
        <View style={styles.composer}><TouchableOpacity activeOpacity={0.7}><MaterialIcons name="add-circle-outline" size={25} color="#0B6E8A" /></TouchableOpacity><TextInput placeholder="Écrire un message…" placeholderTextColor="#7A858F" returnKeyType="send" onSubmitEditing={send} value={draft} onChangeText={setDraft} style={styles.input} /><TouchableOpacity accessibilityLabel="Envoyer" activeOpacity={0.72} onPress={send} style={styles.send}><MaterialIcons name="send" size={19} color="#FFFFFF" /></TouchableOpacity></View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#FFFFFF", flex: 1 },
  header: { alignItems: "center", borderBottomColor: "#F0EFEB", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 15, paddingVertical: 12 },
  contact: { alignItems: "center", flexDirection: "row", gap: 8 },
  name: { color: "#16202A", fontSize: 14, fontWeight: "900" },
  status: { color: "#1D8A5B", fontSize: 11, fontWeight: "700", marginTop: 1 },
  messages: { backgroundColor: "#F7F5EF", flex: 1, padding: 15 },
  dayLabel: { alignItems: "center", marginBottom: 17 },
  dayText: { color: "#7A858F", fontSize: 11, fontWeight: "700" },
  received: { alignSelf: "flex-start", backgroundColor: "#FFFFFF", borderRadius: 16, borderBottomLeftRadius: 4, maxWidth: "82%", paddingHorizontal: 13, paddingVertical: 10 },
  receivedText: { color: "#29333D", fontSize: 13, lineHeight: 18 },
  sent: { alignSelf: "flex-end", backgroundColor: "#0B6E8A", borderRadius: 16, borderBottomRightRadius: 4, marginTop: 10, maxWidth: "82%", paddingHorizontal: 13, paddingVertical: 10 },
  sentText: { color: "#FFFFFF", fontSize: 13, lineHeight: 18 },
  composer: { alignItems: "center", borderTopColor: "#E7E5DE", borderTopWidth: 1, flexDirection: "row", gap: 9, paddingHorizontal: 13, paddingVertical: 10 },
  input: { backgroundColor: "#F2F1EC", borderRadius: 20, color: "#16202A", flex: 1, fontSize: 14, minHeight: 42, paddingHorizontal: 13 },
  send: { alignItems: "center", backgroundColor: "#0B6E8A", borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
});
