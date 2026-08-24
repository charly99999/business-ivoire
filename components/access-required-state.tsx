import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, type Href } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AccessRequiredStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
  destination?: Href;
};

export function AccessRequiredState({
  title = "Votre espace vous attend",
  description = "Créez votre compte avec votre numéro de téléphone pour accéder à cette fonctionnalité.",
  actionLabel = "Créer mon compte",
  destination = "/access" as Href,
}: AccessRequiredStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}><MaterialIcons name="lock-outline" size={30} color="#176B35" /></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <TouchableOpacity activeOpacity={0.75} onPress={() => router.push(destination)} style={styles.button}>
        <Text style={styles.buttonText}>{actionLabel}</Text>
        <MaterialIcons name="arrow-forward" size={18} color="#102015" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", flex: 1, justifyContent: "center", padding: 28 },
  icon: { alignItems: "center", backgroundColor: "#E9F5EC", borderRadius: 26, height: 52, justifyContent: "center", width: 52 },
  title: { color: "#102015", fontSize: 21, fontWeight: "900", marginTop: 16, textAlign: "center" },
  description: { color: "#647067", fontSize: 14, lineHeight: 20, marginTop: 8, maxWidth: 300, textAlign: "center" },
  button: { alignItems: "center", backgroundColor: "#D5A72C", borderRadius: 13, flexDirection: "row", gap: 8, marginTop: 22, paddingHorizontal: 17, paddingVertical: 13 },
  buttonText: { color: "#102015", fontSize: 13, fontWeight: "900" },
});
