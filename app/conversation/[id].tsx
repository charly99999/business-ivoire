import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Avatar } from "@/components/business-ui";
import { AccessRequiredState } from "@/components/access-required-state";
import { ScreenContainer } from "@/components/screen-container";
import { relativeTime, useBusiness } from "@/lib/business-context";
import { fetchSupabaseMessages, sendSupabaseMessage } from "@/lib/supabase-business";

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const conversationId = Array.isArray(id) ? id[0] : id;
  const { authenticated, currentUserId, identityVerified } = useBusiness();
  const [messages, setMessages] = useState<{ id: string; sender_id: string; body: string; created_at: string }[]>([]); const [draft, setDraft] = useState(""); const [sending, setSending] = useState(false); const [loadError, setLoadError] = useState<string>();
  const loadMessages = useCallback(async () => {
    if (!conversationId || !authenticated || !identityVerified) return;
    try { setLoadError(undefined); setMessages(await fetchSupabaseMessages(conversationId)); }
    catch (error) { setMessages([]); setLoadError(error instanceof Error ? error.message : "La conversation n’a pas pu être chargée."); }
  }, [authenticated, conversationId, identityVerified]);
  useEffect(() => { void loadMessages(); }, [loadMessages]);

  const send = async () => {
    const clean = draft.trim();
    if (!clean || !conversationId || !authenticated || !identityVerified) return;
    try { setSending(true); await sendSupabaseMessage(conversationId, clean); setDraft(""); await loadMessages(); }
    catch (error) { Alert.alert("Message non envoyé", error instanceof Error ? error.message : "Vérifiez votre connexion puis réessayez."); }
    finally { setSending(false); }
  };

  if (!authenticated) return <ScreenContainer style={styles.screen}><AccessRequiredState title="Messagerie réservée aux membres" description="Connectez-vous avec votre numéro pour échanger avec les vendeurs de manière sécurisée." actionLabel="Se connecter" /></ScreenContainer>;
  if (!identityVerified) return <ScreenContainer style={styles.screen}><AccessRequiredState title="Selfie requis pour échanger" description="Prenez votre selfie frontal direct avant d’envoyer ou de lire les messages sécurisés." actionLabel="Prendre mon selfie" destination="/selfie" /></ScreenContainer>;
  if (!conversationId) return <ScreenContainer style={styles.screen}><AccessRequiredState title="Conversation introuvable" description="Cette conversation n’est plus disponible. Retournez aux annonces pour démarrer un nouvel échange." actionLabel="Voir les annonces" destination="/discover" /></ScreenContainer>;

  return (
    <ScreenContainer edges={["top", "left", "right"]} style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.screen}>
        <View style={styles.header}><TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}><MaterialIcons name="arrow-back" size={25} color="#16202A" /></TouchableOpacity><View style={styles.contact}><Avatar initials="BI" size="sm" color="#0B6E8A" /><View><Text style={styles.name}>Conversation</Text><Text style={styles.status}>Messagerie sécurisée</Text></View></View><TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/settings" as never)}><MaterialIcons name="info-outline" size={23} color="#0B6E8A" /></TouchableOpacity></View>
        <View style={styles.messages}>{loadError ? <View style={styles.blank}><Text style={styles.blankText}>{loadError}</Text><TouchableOpacity onPress={() => void loadMessages()} style={styles.retry}><Text style={styles.retryText}>Réessayer</Text></TouchableOpacity></View> : <>{messages.map((message) => <View key={message.id} style={message.sender_id === currentUserId ? styles.sent : styles.received}><Text style={message.sender_id === currentUserId ? styles.sentText : styles.receivedText}>{message.body}</Text><Text style={message.sender_id === currentUserId ? styles.sentTime : styles.receivedTime}>{relativeTime(message.created_at)}</Text></View>)}{!messages.length ? <View style={styles.blank}><Text style={styles.blankText}>Démarrez la conversation avec un premier message.</Text></View> : null}</>}</View>
        <View style={styles.composer}><TextInput placeholder="Écrire un message…" placeholderTextColor="#7A858F" returnKeyType="send" onSubmitEditing={() => void send()} value={draft} onChangeText={setDraft} style={styles.input} /><TouchableOpacity disabled={sending} accessibilityLabel="Envoyer" activeOpacity={0.72} onPress={() => void send()} style={styles.send}><MaterialIcons name="send" size={19} color="#FFFFFF" /></TouchableOpacity></View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#FFFFFF", flex: 1 }, header: { alignItems: "center", borderBottomColor: "#F0EFEB", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 15, paddingVertical: 12 }, contact: { alignItems: "center", flexDirection: "row", gap: 8 }, name: { color: "#16202A", fontSize: 14, fontWeight: "900" }, status: { color: "#1D8A5B", fontSize: 11, fontWeight: "700", marginTop: 1 }, messages: { backgroundColor: "#F7F5EF", flex: 1, gap: 10, padding: 15 }, received: { alignSelf: "flex-start", backgroundColor: "#FFFFFF", borderRadius: 16, borderBottomLeftRadius: 4, maxWidth: "82%", paddingHorizontal: 13, paddingVertical: 10 }, receivedText: { color: "#29333D", fontSize: 13, lineHeight: 18 }, receivedTime: { color: "#7A858F", fontSize: 10, marginTop: 4 }, sent: { alignSelf: "flex-end", backgroundColor: "#0B6E8A", borderRadius: 16, borderBottomRightRadius: 4, maxWidth: "82%", paddingHorizontal: 13, paddingVertical: 10 }, sentText: { color: "#FFFFFF", fontSize: 13, lineHeight: 18 }, sentTime: { color: "#D6F0F7", fontSize: 10, marginTop: 4 }, blank: { alignItems: "center", justifyContent: "center", paddingTop: 90 }, blankText: { color: "#667085", fontSize: 13, textAlign: "center" }, retry: { backgroundColor: "#D5A72C", borderRadius: 10, marginTop: 14, paddingHorizontal: 12, paddingVertical: 9 }, retryText: { color: "#102015", fontSize: 12, fontWeight: "900" }, composer: { alignItems: "center", borderTopColor: "#E7E5DE", borderTopWidth: 1, flexDirection: "row", gap: 9, paddingHorizontal: 13, paddingVertical: 10 }, input: { backgroundColor: "#F2F1EC", borderRadius: 20, color: "#16202A", flex: 1, fontSize: 14, minHeight: 42, paddingHorizontal: 13 }, send: { alignItems: "center", backgroundColor: "#0B6E8A", borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
});
