import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Card } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

export default function GroupCreateScreen() {
  const [name, setName] = useState(""); const [description, setDescription] = useState(""); const [category, setCategory] = useState("Immobilier"); const [location, setLocation] = useState("Abidjan, Côte d’Ivoire");
  const utils = trpc.useUtils();
  const create = trpc.groups.create.useMutation({ onSuccess: () => void utils.groups.list.invalidate() });
  const submit = async () => {
    try { await create.mutateAsync({ name: name.trim(), description: description.trim(), category: category.trim(), location: location.trim() }); Alert.alert("Groupe créé", "Vous en êtes maintenant administrateur.", [{ text: "Voir les groupes", onPress: () => router.back() }]); } catch { Alert.alert("Création impossible", "Renseignez un nom, une description et une localisation valides."); }
  };
  return <ScreenContainer style={styles.screen}><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}><MaterialIcons name="arrow-back" size={25} color="#16202A" /></TouchableOpacity><Text style={styles.title}>Créer un groupe</Text><View style={styles.space} /></View><Text style={styles.intro}>Rassemblez une communauté autour d’une activité, d’un quartier ou d’une opportunité locale.</Text><Card style={styles.card}><Field label="Nom du groupe" value={name} onChangeText={setName} placeholder="Ex. Immobilier Abidjan" /><Field label="Catégorie" value={category} onChangeText={setCategory} placeholder="Immobilier" /><Field label="Localisation" value={location} onChangeText={setLocation} placeholder="Abidjan, Côte d’Ivoire" /><Text style={styles.label}>Description</Text><TextInput multiline value={description} onChangeText={setDescription} placeholder="Présentez l’objectif et les règles du groupe" placeholderTextColor="#98A2B3" style={styles.description} textAlignVertical="top" /></Card><TouchableOpacity disabled={create.isPending} activeOpacity={0.78} onPress={() => void submit()} style={[styles.button, create.isPending && styles.disabled]}><MaterialIcons name="group-add" size={20} color="#FFFFFF" /><Text style={styles.buttonText}>{create.isPending ? "Création…" : "Créer le groupe"}</Text></TouchableOpacity></ScrollView></ScreenContainer>;
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) { return <View><Text style={styles.label}>{label}</Text><TextInput {...props} placeholderTextColor="#98A2B3" style={styles.input} /></View>; }
const styles = StyleSheet.create({ screen: { backgroundColor: "#F7F5EF" }, content: { padding: 16, paddingBottom: 32 }, header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, title: { color: "#16202A", fontSize: 18, fontWeight: "900" }, space: { width: 25 }, intro: { color: "#667085", fontSize: 14, lineHeight: 21, marginTop: 18 }, card: { gap: 14, marginTop: 18, padding: 14 }, label: { color: "#667085", fontSize: 11, fontWeight: "900", letterSpacing: 0.4, marginBottom: 6, textTransform: "uppercase" }, input: { backgroundColor: "#F7F5EF", borderColor: "#E7E5DE", borderRadius: 11, borderWidth: 1, color: "#16202A", fontSize: 14, minHeight: 46, paddingHorizontal: 11 }, description: { backgroundColor: "#F7F5EF", borderColor: "#E7E5DE", borderRadius: 11, borderWidth: 1, color: "#16202A", fontSize: 14, minHeight: 130, padding: 11 }, button: { alignItems: "center", backgroundColor: "#0B6E8A", borderRadius: 15, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 15, minHeight: 52 }, disabled: { opacity: 0.65 }, buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" } });
