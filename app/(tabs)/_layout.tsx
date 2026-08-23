import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BusinessProvider } from "@/lib/business-context";
import { AuthGate } from "@/components/auth-gate";

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
    <BusinessProvider>
      <AuthGate>
      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#0B6E8A",
          tabBarInactiveTintColor: "#7A858F",
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
      </AuthGate>
    </BusinessProvider>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: "700", marginTop: 2 },
  tabBar: { backgroundColor: "#FFFFFF", borderTopColor: "#E7E5DE", borderTopWidth: 1, paddingTop: 7 },
});
