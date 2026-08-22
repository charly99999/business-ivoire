import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Avatar, Card, Tag } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useBusiness, type FeedPost } from "@/lib/business-context";

const OPTIONS: { label: FeedPost["tag"]; icon: React.ComponentProps<typeof MaterialIcons>["name"] }[] = [
  { label: "Immobilier", icon: "apartment" },
  { label: "Entrepreneuriat", icon: "trending-up" },
  { label: "Opportunité", icon: "lightbulb-outline" },
];

export default function CreateScreen() {
  const { profile, publishPost } = useBusiness();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<FeedPost["tag"]>("Opportunité");

  const submit = () => {
    if (!text.trim()) {
      Alert.alert("Ajoutez un message", "Décrivez l’opportunité ou l’information que vous souhaitez partager.");
      return;
    }
    publishPost(text, category);
    setText("");
    Alert.alert("Publication créée", "Votre contenu est maintenant visible dans votre fil local.", [{ text: "Voir le fil", onPress: () => router.replace("/") }]);
  };

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.header}><Text style={styles.title}>Créer</Text><TouchableOpacity activeOpacity={0.7} onPress={submit} style={styles.publishSmall}><Text style={styles.publishSmallText}>Publier</Text></TouchableOpacity></View>
      <Card style={styles.composerCard}>
        <View style={styles.identity}><Avatar initials="BI" uri={profile.selfieUri} /><View><Text style={styles.name}>{profile.name}</Text><Tag label="Public" tint="blue" /></View></View>
        <TextInput multiline placeholder="Quelle opportunité souhaitez-vous partager ?" placeholderTextColor="#7A858F" style={styles.input} textAlignVertical="top" value={text} onChangeText={setText} />
        <View style={styles.divider} />
        <Text style={styles.fieldLabel}>Catégorie</Text>
        <View style={styles.optionGrid}>{OPTIONS.map((option) => <TouchableOpacity key={option.label} onPress={() => setCategory(option.label)} activeOpacity={0.7} style={[styles.option, category === option.label && styles.optionSelected]}><MaterialIcons name={option.icon} size={20} color={category === option.label ? "#FFFFFF" : "#0B6E8A"} /><Text style={[styles.optionText, category === option.label && styles.optionTextSelected]}>{option.label}</Text></TouchableOpacity>)}</View>
      </Card>
      <Card style={styles.attachments}><Text style={styles.attachmentTitle}>Ajouter à votre publication</Text><View style={styles.attachmentRow}><TouchableOpacity activeOpacity={0.7} onPress={() => Alert.alert("Bientôt disponible", "L’ajout de médias sera connecté au stockage sécurisé lors de la version serveur.")} style={styles.attachmentItem}><MaterialIcons name="photo-library" size={21} color="#1D8A5B" /><Text style={styles.attachmentText}>Photo</Text></TouchableOpacity><TouchableOpacity activeOpacity={0.7} onPress={() => Alert.alert("Bientôt disponible", "La création de Reels nécessitera le stockage et le traitement vidéo côté serveur.")} style={styles.attachmentItem}><MaterialIcons name="play-circle-outline" size={21} color="#E8752B" /><Text style={styles.attachmentText}>Reel</Text></TouchableOpacity><TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/selfie" as never)} style={styles.attachmentItem}><MaterialIcons name="verified-user" size={21} color="#0B6E8A" /><Text style={styles.attachmentText}>Selfie</Text></TouchableOpacity></View></Card>
      <TouchableOpacity activeOpacity={0.78} onPress={submit} style={styles.publishButton}><MaterialIcons name="send" size={20} color="#FFFFFF" /><Text style={styles.publishButtonText}>Publier dans la communauté</Text></TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F7F5EF", padding: 14 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  title: { color: "#16202A", fontSize: 27, fontWeight: "900", letterSpacing: -0.6 },
  publishSmall: { backgroundColor: "#E2F2F6", borderRadius: 12, paddingHorizontal: 13, paddingVertical: 9 },
  publishSmallText: { color: "#0B6E8A", fontSize: 13, fontWeight: "800" },
  composerCard: { padding: 15 },
  identity: { alignItems: "center", flexDirection: "row", gap: 10 },
  name: { color: "#16202A", fontSize: 15, fontWeight: "800", marginBottom: 3 },
  input: { color: "#16202A", fontSize: 17, lineHeight: 24, minHeight: 180, paddingTop: 22 },
  divider: { backgroundColor: "#EEECE6", height: 1, marginBottom: 15 },
  fieldLabel: { color: "#667085", fontSize: 12, fontWeight: "800", letterSpacing: 0.3, textTransform: "uppercase" },
  optionGrid: { gap: 8, marginTop: 10 },
  option: { alignItems: "center", borderColor: "#D8E5E8", borderRadius: 13, borderWidth: 1, flexDirection: "row", gap: 9, minHeight: 44, paddingHorizontal: 12 },
  optionSelected: { backgroundColor: "#0B6E8A", borderColor: "#0B6E8A" },
  optionText: { color: "#0B6E8A", fontSize: 13, fontWeight: "800" },
  optionTextSelected: { color: "#FFFFFF" },
  attachments: { marginTop: 13, padding: 15 },
  attachmentTitle: { color: "#29333D", fontSize: 14, fontWeight: "800" },
  attachmentRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  attachmentItem: { alignItems: "center", gap: 5, minWidth: 70 },
  attachmentText: { color: "#667085", fontSize: 12, fontWeight: "700" },
  publishButton: { alignItems: "center", backgroundColor: "#0B6E8A", borderRadius: 15, flexDirection: "row", gap: 9, justifyContent: "center", marginTop: 16, minHeight: 52 },
  publishButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});
