import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Avatar, Card, Tag } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useBusiness } from "@/lib/business-context";

const COVER_FALLBACK = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80";

export default function ProfileScreen() {
  const { profile, posts, setCoverUri } = useBusiness();
  const localPosts = posts.filter((post) => post.author === profile.name).slice(0, 2);

  const pickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.85 });
    if (!result.canceled) setCoverUri(result.assets[0].uri);
  };

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topBar}><Text style={styles.topTitle}>Votre Page</Text><View style={styles.topActions}><TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/notifications" as never)}><MaterialIcons name="notifications-none" size={25} color="#16202A" /></TouchableOpacity><TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/menu" as never)}><MaterialIcons name="menu" size={27} color="#16202A" /></TouchableOpacity></View></View>
        <View style={styles.hero}>
          <Image source={{ uri: profile.coverUri || COVER_FALLBACK }} style={styles.cover} accessibilityLabel="Photo de couverture" />
          <TouchableOpacity activeOpacity={0.75} onPress={pickCover} style={styles.coverEdit}><MaterialIcons name="photo-library" size={18} color="#FFFFFF" /><Text style={styles.coverEditText}>Modifier</Text></TouchableOpacity>
          <View style={styles.profileAvatar}><Avatar initials="BI" uri={profile.selfieUri} size="lg" color="#0B6E8A" /></View>
        </View>
        <View style={styles.identity}><Text style={styles.name}>{profile.name}</Text><Text style={styles.category}>{profile.category}</Text><View style={styles.infoLine}><MaterialIcons name="location-on" size={16} color="#667085" /><Text style={styles.infoText}>{profile.location}</Text></View><Text style={styles.followers}>{profile.followers.toLocaleString("fr-FR")} followers · 98 suivis</Text></View>
        <View style={styles.primaryActions}><TouchableOpacity activeOpacity={0.76} onPress={() => router.push("/dashboard" as never)} style={styles.primaryButton}><MaterialIcons name="insights" size={19} color="#FFFFFF" /><Text style={styles.primaryButtonText}>Tableau de bord</Text></TouchableOpacity><TouchableOpacity accessibilityLabel="Ouvrir les options" activeOpacity={0.7} onPress={() => router.push("/menu" as never)} style={styles.moreButton}><MaterialIcons name="more-horiz" size={23} color="#0B6E8A" /></TouchableOpacity></View>
        <View style={styles.secondaryActions}><TouchableOpacity activeOpacity={0.7} onPress={() => Alert.alert("Promotion inactive", "Business Ivoire est gratuit : aucune promotion payante n’est disponible.")} style={styles.secondaryButton}><MaterialIcons name="campaign" size={18} color="#0B6E8A" /><Text style={styles.secondaryText}>Promouvoir</Text></TouchableOpacity><TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/create" as never)} style={styles.secondaryButton}><MaterialIcons name="add-circle-outline" size={18} color="#0B6E8A" /><Text style={styles.secondaryText}>Ajouter à la story</Text></TouchableOpacity></View>
        {!profile.selfieUri ? <Card style={styles.identityNotice}><View style={styles.noticeIcon}><MaterialIcons name="verified-user" size={24} color="#0B6E8A" /></View><View style={styles.noticeCopy}><Text style={styles.noticeTitle}>Vérifiez votre identité</Text><Text style={styles.noticeText}>Votre Page nécessite un selfie pris en direct. Aucun choix depuis la galerie n’est accepté.</Text><TouchableOpacity activeOpacity={0.72} onPress={() => router.push("/selfie" as never)} style={styles.noticeButton}><Text style={styles.noticeButtonText}>Prendre mon selfie</Text></TouchableOpacity></View></Card> : <Card style={styles.verifiedCard}><MaterialIcons name="verified" size={23} color="#1D8A5B" /><View><Text style={styles.verifiedTitle}>Selfie enregistré</Text><Text style={styles.verifiedText}>Votre identité est associée à cette version locale.</Text></View></Card>}
        <Card style={styles.about}><Text style={styles.sectionTitle}>À propos</Text><Text style={styles.bio}>{profile.bio}</Text><View style={styles.aboutLine}><MaterialIcons name="schedule" size={18} color="#0B6E8A" /><Text style={styles.aboutText}>Ouvert aujourd’hui · 08:00–18:00</Text></View><View style={styles.aboutLine}><MaterialIcons name="mail-outline" size={18} color="#0B6E8A" /><Text style={styles.aboutText}>contact@businessivoire.ci</Text></View></Card>
        <View style={styles.contentHeading}><Text style={styles.sectionTitle}>Contenu</Text><TouchableOpacity onPress={() => router.push("/create" as never)} activeOpacity={0.7}><Text style={styles.createLink}>Créer</Text></TouchableOpacity></View>
        {localPosts.length ? localPosts.map((post) => <Card key={post.id} style={styles.miniPost}><Tag label={post.tag} tint="orange" /><Text style={styles.miniPostText}>{post.text}</Text><Text style={styles.miniPostMeta}>{post.reactions} réactions · {post.comments} commentaires</Text></Card>) : <Card style={styles.emptyPost}><MaterialIcons name="edit-note" size={28} color="#0B6E8A" /><Text style={styles.emptyTitle}>Votre Page est prête à parler</Text><Text style={styles.emptyText}>Partagez votre première actualité, annonce ou opportunité locale.</Text><TouchableOpacity style={styles.emptyAction} activeOpacity={0.72} onPress={() => router.push("/create" as never)}><Text style={styles.emptyActionText}>Créer une publication</Text></TouchableOpacity></Card>}
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/settings" as never)} style={styles.settingsLink}><MaterialIcons name="settings" size={20} color="#667085" /><Text style={styles.settingsText}>Paramètres et confidentialité</Text><MaterialIcons name="chevron-right" size={21} color="#667085" /></TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F7F5EF" },
  content: { paddingBottom: 32 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 9 },
  topTitle: { color: "#16202A", fontSize: 18, fontWeight: "900" },
  topActions: { flexDirection: "row", gap: 19 },
  hero: { height: 190, position: "relative" },
  cover: { height: 160, resizeMode: "cover", width: "100%" },
  coverEdit: { alignItems: "center", backgroundColor: "rgba(22,32,42,0.8)", borderRadius: 12, bottom: 39, flexDirection: "row", gap: 5, paddingHorizontal: 10, paddingVertical: 7, position: "absolute", right: 13 },
  coverEditText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  profileAvatar: { backgroundColor: "#F7F5EF", borderColor: "#F7F5EF", borderRadius: 42, borderWidth: 3, bottom: -3, left: 18, position: "absolute" },
  identity: { paddingHorizontal: 18, paddingTop: 1 },
  name: { color: "#16202A", fontSize: 25, fontWeight: "900", letterSpacing: -0.5 },
  category: { color: "#0B6E8A", fontSize: 13, fontWeight: "800", marginTop: 3 },
  infoLine: { alignItems: "center", flexDirection: "row", gap: 3, marginTop: 9 },
  infoText: { color: "#667085", fontSize: 13, fontWeight: "600" },
  followers: { color: "#667085", fontSize: 13, fontWeight: "600", marginTop: 6 },
  primaryActions: { flexDirection: "row", gap: 10, paddingHorizontal: 15, paddingTop: 16 },
  primaryButton: { alignItems: "center", backgroundColor: "#0B6E8A", borderRadius: 13, flex: 1, flexDirection: "row", gap: 7, justifyContent: "center", minHeight: 46 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  moreButton: { alignItems: "center", backgroundColor: "#E2F2F6", borderRadius: 13, justifyContent: "center", width: 48 },
  secondaryActions: { flexDirection: "row", gap: 10, paddingHorizontal: 15, paddingTop: 10 },
  secondaryButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E7E5DE", borderRadius: 13, borderWidth: 1, flex: 1, flexDirection: "row", gap: 7, justifyContent: "center", minHeight: 42 },
  secondaryText: { color: "#0B6E8A", fontSize: 12, fontWeight: "800" },
  identityNotice: { flexDirection: "row", gap: 11, marginHorizontal: 15, marginTop: 15, padding: 13 },
  noticeIcon: { alignItems: "center", backgroundColor: "#E2F2F6", borderRadius: 18, height: 42, justifyContent: "center", width: 42 },
  noticeCopy: { flex: 1 },
  noticeTitle: { color: "#16202A", fontSize: 14, fontWeight: "900" },
  noticeText: { color: "#667085", fontSize: 12, lineHeight: 17, marginTop: 3 },
  noticeButton: { alignSelf: "flex-start", marginTop: 10 },
  noticeButtonText: { color: "#0B6E8A", fontSize: 12, fontWeight: "900" },
  verifiedCard: { alignItems: "center", flexDirection: "row", gap: 10, marginHorizontal: 15, marginTop: 15, padding: 13 },
  verifiedTitle: { color: "#16734C", fontSize: 13, fontWeight: "900" },
  verifiedText: { color: "#667085", fontSize: 12, marginTop: 2 },
  about: { gap: 10, marginHorizontal: 15, marginTop: 15, padding: 15 },
  sectionTitle: { color: "#16202A", fontSize: 17, fontWeight: "900" },
  bio: { color: "#475467", fontSize: 14, lineHeight: 20 },
  aboutLine: { alignItems: "center", flexDirection: "row", gap: 8 },
  aboutText: { color: "#475467", fontSize: 13, fontWeight: "600" },
  contentHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginHorizontal: 15, marginBottom: 10, marginTop: 20 },
  createLink: { color: "#0B6E8A", fontSize: 13, fontWeight: "800" },
  miniPost: { gap: 9, marginHorizontal: 15, marginBottom: 10, padding: 14 },
  miniPostText: { color: "#29333D", fontSize: 14, lineHeight: 20 },
  miniPostMeta: { color: "#7A858F", fontSize: 12, fontWeight: "600" },
  emptyPost: { alignItems: "flex-start", gap: 8, marginHorizontal: 15, padding: 16 },
  emptyTitle: { color: "#16202A", fontSize: 15, fontWeight: "900" },
  emptyText: { color: "#667085", fontSize: 13, lineHeight: 19 },
  emptyAction: { backgroundColor: "#E2F2F6", borderRadius: 10, marginTop: 4, paddingHorizontal: 12, paddingVertical: 8 },
  emptyActionText: { color: "#0B6E8A", fontSize: 12, fontWeight: "800" },
  settingsLink: { alignItems: "center", flexDirection: "row", gap: 9, marginHorizontal: 18, marginTop: 21 },
  settingsText: { color: "#667085", flex: 1, fontSize: 13, fontWeight: "700" },
});
