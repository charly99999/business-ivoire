import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ICONS = {
  index: "home-filled",
  discover: "explore",
  create: "add-circle",
  messages: "chat-bubble",
  profile: "person",
} as const;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const paddingBottom = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);

  return (
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#D5A72C",
          tabBarInactiveTintColor: "#AAB6A9",
          tabBarLabelStyle: styles.label,
          tabBarStyle: [styles.tabBar, { height: 58 + paddingBottom, paddingBottom }],
          tabBarIcon: ({ color, size }) => <MaterialIcons name={ICONS[route.name as keyof typeof ICONS]} size={size} color={color} />,
        })}
      >
        <Tabs.Screen name="index" options={{ title: "Accueil" }} />
        <Tabs.Screen name="discover" options={{ title: "Découvrir" }} />
        <Tabs.Screen name="create" options={{ title: "Créer" }} />
        <Tabs.Screen name="messages" options={{ title: "Messages" }} />
        <Tabs.Screen name="profile" options={{ title: "Profil" }} />
      </Tabs>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: "700", marginTop: 2 },
  tabBar: { backgroundColor: "#07150B", borderTopColor: "#24462B", borderTopWidth: 1, paddingTop: 7 },
});
