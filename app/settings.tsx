import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Card } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useBusiness } from "@/lib/business-context";

export default function SettingsScreen() {
  const { profile, updateProfile } = useBusiness();
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [category, setCategory] = useState(profile.category);
  const [location, setLocation] = useState(profile.location);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [email, setEmail] = useState(profile.contactEmail ?? "");
  const [locked, setLocked] = useState(profile.locked);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(profile.name); setBio(profile.bio); setCategory(profile.category); setLocation(profile.location); setPhone(profile.phone ?? ""); setEmail(profile.contactEmail ?? ""); setLocked(profile.locked);
  }, [profile]);

  const save = async () => {
    if (name.trim().length < 2 || location.trim().length < 2) {
      Alert.alert("Informations incomplètes", "Le nom de la Page et la localisation sont requis.");
      return;
    }
    try {
      setSaving(true);
      await updateProfile({ name: name.trim(), bio: bio.trim(), category: category.trim(), location: location.trim(), phone: phone.trim(), contactEmail: email.trim(), locked });
      Alert.alert("Page enregistrée", "Vos coordonnées et préférences de visibilité sont à jour.");
    } catch {
      Alert.alert("Enregistrement impossible", "Vérifiez les informations saisies et votre connexion.");
    } finally { setSaving(false); }
  };

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}><MaterialIcons name="arrow-back" size={25} color="#16202A" /></TouchableOpacity><Text style={styles.title}>Paramètres</Text><TouchableOpacity disabled={saving} activeOpacity={0.7} onPress={() => void save()}><Text style={styles.save}>{saving ? "Enregistrement…" : "Enregistrer"}</Text></TouchableOpacity></View>
        <Text style={styles.intro}>Votre Page professionnelle</Text><Text style={styles.helper}>Ces informations sont enregistrées pour votre compte et visibles selon vos préférences de confidentialité.</Text>
        <Card style={styles.formCard}><Field label="Nom de la Page" value={name} onChangeText={setName} /><Field label="Catégorie" value={category} onChangeText={setCategory} /><Field label="Localisation" value={location} onChangeText={setLocation} /><Field label="Téléphone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" /><Field label="E-mail de contact" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" /><Text style={styles.label}>Présentation</Text><TextInput multiline value={bio} onChangeText={setBio} placeholder="Présentez votre activité" placeholderTextColor="#98A2B3" style={styles.textArea} textAlignVertical="top" /></Card>
        <Card style={styles.switchCard}><View style={styles.switchCopy}><Text style={styles.switchTitle}>Verrouillage du profil</Text><Text style={styles.switchText}>Restreint la visibilité des informations de votre profil au réseau qui vous suit.</Text></View><Switch value={locked} trackColor={{ false: "#D0D5DD", true: "#0B6E8A" }} onValueChange={setLocked} /></Card>
        <TouchableOpacity activeOpacity={0.72} onPress={() => router.push("/selfie" as never)} style={styles.identityRow}><View style={styles.identityIcon}><MaterialIcons name="verified-user" size={22} color="#0B6E8A" /></View><View style={styles.identityCopy}><Text style={styles.identityTitle}>Selfie de vérification</Text><Text style={styles.identityText}>{profile.identityStatus === "pending" ? "Action requise pour activer votre identité." : "Selfie enregistré pour votre compte."}</Text></View><MaterialIcons name="chevron-right" size={23} color="#98A2B3" /></TouchableOpacity>
        <Card style={styles.notice}><MaterialIcons name="info-outline" size={22} color="#E8752B" /><Text style={styles.noticeText}>Business Ivoire reste gratuit : aucun paiement, abonnement ou promotion payante n’est activé.</Text></Card>
      </ScrollView>
    </ScreenContainer>
  );
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return <View><Text style={styles.label}>{label}</Text><TextInput {...props} placeholderTextColor="#98A2B3" style={styles.input} /></View>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F7F5EF" }, content: { padding: 16, paddingBottom: 34 }, header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, title: { color: "#16202A", fontSize: 18, fontWeight: "900" }, save: { color: "#0B6E8A", fontSize: 13, fontWeight: "900" }, intro: { color: "#16202A", fontSize: 25, fontWeight: "900", letterSpacing: -0.6, marginTop: 22 }, helper: { color: "#667085", fontSize: 14, lineHeight: 20, marginTop: 8 }, formCard: { gap: 13, marginTop: 17, padding: 14 }, label: { color: "#667085", fontSize: 11, fontWeight: "900", letterSpacing: 0.4, marginBottom: 6, textTransform: "uppercase" }, input: { backgroundColor: "#F7F5EF", borderColor: "#E7E5DE", borderRadius: 11, borderWidth: 1, color: "#16202A", fontSize: 14, minHeight: 45, paddingHorizontal: 11 }, textArea: { backgroundColor: "#F7F5EF", borderColor: "#E7E5DE", borderRadius: 11, borderWidth: 1, color: "#16202A", fontSize: 14, minHeight: 92, padding: 11 }, switchCard: { alignItems: "center", flexDirection: "row", gap: 12, marginTop: 14, padding: 14 }, switchCopy: { flex: 1 }, switchTitle: { color: "#16202A", fontSize: 14, fontWeight: "900" }, switchText: { color: "#667085", fontSize: 12, lineHeight: 17, marginTop: 3 }, identityRow: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E7E5DE", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 11, marginTop: 14, padding: 13 }, identityIcon: { alignItems: "center", backgroundColor: "#E2F2F6", borderRadius: 14, height: 42, justifyContent: "center", width: 42 }, identityCopy: { flex: 1 }, identityTitle: { color: "#16202A", fontSize: 14, fontWeight: "900" }, identityText: { color: "#667085", fontSize: 12, marginTop: 3 }, notice: { alignItems: "flex-start", flexDirection: "row", gap: 9, marginTop: 14, padding: 13 }, noticeText: { color: "#667085", flex: 1, fontSize: 12, lineHeight: 18 },
});
