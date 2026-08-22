import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image, StyleSheet, Text, TouchableOpacity, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from "react-native";

const AVATAR_DIMENSIONS = {
  sm: 34,
  md: 44,
  lg: 76,
} as const;

export function Avatar({ initials, uri, size = "md", color = "#0B6E8A" }: { initials: string; uri?: string; size?: keyof typeof AVATAR_DIMENSIONS; color?: string }) {
  const dimension = AVATAR_DIMENSIONS[size];
  const sizeStyle = { height: dimension, width: dimension };
  const source: ImageSourcePropType | undefined = uri ? { uri } : undefined;
  if (source) return <Image accessibilityLabel="Photo de profil" source={source} style={[styles.avatarImage, sizeStyle]} />;
  return (
    <View style={[styles.avatarFallback, sizeStyle, { backgroundColor: color }]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

export function ActionIcon({ icon, label, onPress, badge }: { icon: React.ComponentProps<typeof MaterialIcons>["name"]; label: string; onPress: () => void; badge?: number }) {
  return (
    <TouchableOpacity accessibilityLabel={label} activeOpacity={0.72} onPress={onPress} style={styles.actionIcon}>
      <MaterialIcons name={icon} size={24} color="#16202A" />
      {badge ? <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View> : null}
    </TouchableOpacity>
  );
}

export function Tag({ label, tint = "blue" }: { label: string; tint?: "blue" | "orange" | "green" }) {
  const color = tint === "orange" ? styles.tagOrange : tint === "green" ? styles.tagGreen : styles.tagBlue;
  const text = tint === "orange" ? styles.tagOrangeText : tint === "green" ? styles.tagGreenText : styles.tagBlueText;
  return <View style={[styles.tag, color]}><Text style={[styles.tagText, text]}>{label}</Text></View>;
}

export function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionHeading}>{title}</Text>
      {action && onPress ? <TouchableOpacity onPress={onPress} activeOpacity={0.7}><Text style={styles.sectionAction}>{action}</Text></TouchableOpacity> : null}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  avatarFallback: { alignItems: "center", borderRadius: 999, justifyContent: "center", overflow: "hidden" },
  avatarImage: { borderRadius: 999, resizeMode: "cover" },
  avatarText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  actionIcon: { alignItems: "center", height: 44, justifyContent: "center", position: "relative", width: 44 },
  badge: { alignItems: "center", backgroundColor: "#E8752B", borderColor: "#F7F5EF", borderRadius: 10, borderWidth: 2, height: 20, justifyContent: "center", position: "absolute", right: 0, top: 1, minWidth: 20 },
  badgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  tag: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  tagBlue: { backgroundColor: "#E2F2F6" },
  tagOrange: { backgroundColor: "#FBE8DA" },
  tagGreen: { backgroundColor: "#DCF3E8" },
  tagText: { fontSize: 12, fontWeight: "700" },
  tagBlueText: { color: "#0B6E8A" },
  tagOrangeText: { color: "#B55318" },
  tagGreenText: { color: "#16734C" },
  sectionTitle: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 12, marginTop: 6 },
  sectionHeading: { color: "#16202A", fontSize: 18, fontWeight: "800", letterSpacing: -0.2 },
  sectionAction: { color: "#0B6E8A", fontSize: 14, fontWeight: "700" },
  card: { backgroundColor: "#FFFFFF", borderColor: "#E7E5DE", borderRadius: 18, borderWidth: 1, shadowColor: "#16202A", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 1 },
});
