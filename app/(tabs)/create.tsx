import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Avatar, Card, Tag } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useBusiness, type FeedPost } from "@/lib/business-context";
import { imageUriToDataUri } from "@/lib/media";

const OPTIONS: { label: FeedPost["tag"]; icon: React.ComponentProps<typeof MaterialIcons>["name"] }[] = [
  { label: "Immobilier", icon: "apartment" },
  { label: "Entrepreneuriat", icon: "trending-up" },
  { label: "Opportunité", icon: "lightbulb-outline" },
];

export default function CreateScreen() {
  const { profile, publishPost } = useBusiness();
  const [text, setText] = useState("");
  const [category, setCategory] = useState<FeedPost["tag"]>("Opportunité");
  const [photoUri, setPhotoUri] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.55 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const submit = async () => {
    if (!text.trim()) {
      Alert.alert("Ajoutez un message", "Décrivez l’opportunité ou l’information que vous souhaitez partager.");
      return;
    }
    try {
      setSubmitting(true);
      const mediaImage = photoUri ? await imageUriToDataUri(photoUri) : undefined;
      await publishPost(text, category, mediaImage);
      setText("");
      setPhotoUri(undefined);
      Alert.alert("Publication créée", "Votre contenu est maintenant visible dans la communauté.", [{ text: "Voir le fil", onPress: () => router.replace("/") }]);
    } catch {
      Alert.alert("Publication non enregistrée", "Vérifiez votre connexion puis réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.header}><Text style={styles.title}>Créer</Text><TouchableOpacity activeOpacity={0.7} onPress={submit} style={styles.publishSmall}><Text style={styles.publishSmallText}>Publier</Text></TouchableOpacity></View>
      <Card style={styles.composerCard}>
        <View style={styles.identity}><Avatar initials="BI" uri={profile.selfieUri} /><View><Text style={styles.name}>{profile.name}</Text><Tag label="Public" tint="blue" /></View></View>
        <TextInput multiline placeholder="Quelle opportunité souhaitez-vous partager ?" placeholderTextColor="#7A858F" style={styles.input} textAlignVertical="top" value={text} onChangeText={setText} />
        {photoUri ? <View style={styles.previewWrap}><Image source={{ uri: photoUri }} style={styles.preview} /><TouchableOpacity activeOpacity={0.7} onPress={() => setPhotoUri(undefined)} style={styles.removePhoto}><MaterialIcons name="close" size={18} color="#FFFFFF" /></TouchableOpacity></View> : null}
        <View style={styles.divider} />
        <Text style={styles.fieldLabel}>Catégorie</Text>
        <View style={styles.optionGrid}>{OPTIONS.map((option) => <TouchableOpacity key={option.label} onPress={() => setCategory(option.label)} activeOpacity={0.7} style={[styles.option, category === option.label && styles.optionSelected]}><MaterialIcons name={option.icon} size={20} color={category === option.label ? "#FFFFFF" : "#0B6E8A"} /><Text style={[styles.optionText, category === option.label && styles.optionTextSelected]}>{option.label}</Text></TouchableOpacity>)}</View>
      </Card>
      <Card style={styles.attachments}><Text style={styles.attachmentTitle}>Ajouter à votre publication</Text><View style={styles.attachmentRow}><TouchableOpacity activeOpacity={0.7} onPress={pickPhoto} style={styles.attachmentItem}><MaterialIcons name="photo-library" size={21} color="#1D8A5B" /><Text style={styles.attachmentText}>Photo</Text></TouchableOpacity><TouchableOpacity activeOpacity={0.7} onPress={() => Alert.alert("Reels à venir", "Le format vidéo est prévu pour une itération ultérieure, avec traitement vidéo serveur dédié.")} style={styles.attachmentItem}><MaterialIcons name="play-circle-outline" size={21} color="#E8752B" /><Text style={styles.attachmentText}>Reel</Text></TouchableOpacity><TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/selfie" as never)} style={styles.attachmentItem}><MaterialIcons name="verified-user" size={21} color="#0B6E8A" /><Text style={styles.attachmentText}>Selfie</Text></TouchableOpacity></View></Card>
      <TouchableOpacity disabled={submitting} activeOpacity={0.78} onPress={submit} style={[styles.publishButton, submitting && styles.publishButtonDisabled]}><MaterialIcons name="send" size={20} color="#FFFFFF" /><Text style={styles.publishButtonText}>{submitting ? "Publication…" : "Publier dans la communauté"}</Text></TouchableOpacity>
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
  previewWrap: { marginBottom: 14, position: "relative" },
  preview: { borderRadius: 14, height: 170, resizeMode: "cover", width: "100%" },
  removePhoto: { alignItems: "center", backgroundColor: "rgba(22,32,42,0.78)", borderRadius: 16, height: 32, justifyContent: "center", position: "absolute", right: 9, top: 9, width: 32 },
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
  publishButtonDisabled: { opacity: 0.65 },
  publishButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});
