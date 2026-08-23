import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Avatar } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";
import { relativeTime, useBusiness } from "@/lib/business-context";
import { trpc } from "@/lib/trpc";

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = Number(id);
  const { conversations, currentUserId, sendMessage } = useBusiness();
  const conversation = conversations.find((item) => item.id === conversationId);
  const messageQuery = trpc.conversations.messages.useQuery({ conversationId }, { enabled: Number.isInteger(conversationId) && conversationId > 0 });
  const [draft, setDraft] = useState("");

  const send = async () => {
    const clean = draft.trim();
    if (!clean) return;
    await sendMessage(conversationId, clean);
    setDraft("");
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]} style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.screen}>
        <View style={styles.header}><TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}><MaterialIcons name="arrow-back" size={25} color="#16202A" /></TouchableOpacity><View style={styles.contact}><Avatar initials={conversation?.initials ?? "BI"} size="sm" color={conversation?.color ?? "#0B6E8A"} /><View><Text style={styles.name}>{conversation?.name ?? "Conversation"}</Text><Text style={styles.status}>Messagerie sécurisée</Text></View></View><TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/settings" as never)}><MaterialIcons name="info-outline" size={23} color="#0B6E8A" /></TouchableOpacity></View>
        <View style={styles.messages}>{(messageQuery.data ?? []).map((message) => <View key={message.id} style={message.senderId === currentUserId ? styles.sent : styles.received}><Text style={message.senderId === currentUserId ? styles.sentText : styles.receivedText}>{message.body}</Text><Text style={message.senderId === currentUserId ? styles.sentTime : styles.receivedTime}>{relativeTime(message.createdAt)}</Text></View>)}{!messageQuery.data?.length ? <View style={styles.blank}><Text style={styles.blankText}>Démarrez la conversation avec un premier message.</Text></View> : null}</View>
        <View style={styles.composer}><TextInput placeholder="Écrire un message…" placeholderTextColor="#7A858F" returnKeyType="send" onSubmitEditing={() => void send()} value={draft} onChangeText={setDraft} style={styles.input} /><TouchableOpacity accessibilityLabel="Envoyer" activeOpacity={0.72} onPress={() => void send()} style={styles.send}><MaterialIcons name="send" size={19} color="#FFFFFF" /></TouchableOpacity></View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#FFFFFF", flex: 1 }, header: { alignItems: "center", borderBottomColor: "#F0EFEB", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 15, paddingVertical: 12 }, contact: { alignItems: "center", flexDirection: "row", gap: 8 }, name: { color: "#16202A", fontSize: 14, fontWeight: "900" }, status: { color: "#1D8A5B", fontSize: 11, fontWeight: "700", marginTop: 1 }, messages: { backgroundColor: "#F7F5EF", flex: 1, gap: 10, padding: 15 }, received: { alignSelf: "flex-start", backgroundColor: "#FFFFFF", borderRadius: 16, borderBottomLeftRadius: 4, maxWidth: "82%", paddingHorizontal: 13, paddingVertical: 10 }, receivedText: { color: "#29333D", fontSize: 13, lineHeight: 18 }, receivedTime: { color: "#7A858F", fontSize: 10, marginTop: 4 }, sent: { alignSelf: "flex-end", backgroundColor: "#0B6E8A", borderRadius: 16, borderBottomRightRadius: 4, maxWidth: "82%", paddingHorizontal: 13, paddingVertical: 10 }, sentText: { color: "#FFFFFF", fontSize: 13, lineHeight: 18 }, sentTime: { color: "#D6F0F7", fontSize: 10, marginTop: 4 }, blank: { alignItems: "center", justifyContent: "center", paddingTop: 90 }, blankText: { color: "#667085", fontSize: 13 }, composer: { alignItems: "center", borderTopColor: "#E7E5DE", borderTopWidth: 1, flexDirection: "row", gap: 9, paddingHorizontal: 13, paddingVertical: 10 }, input: { backgroundColor: "#F2F1EC", borderRadius: 20, color: "#16202A", flex: 1, fontSize: 14, minHeight: 42, paddingHorizontal: 13 }, send: { alignItems: "center", backgroundColor: "#0B6E8A", borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
});
