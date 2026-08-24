import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useBusiness } from "@/lib/business-context";
import { updateMyBusinessProfile } from "@/lib/supabase-business";
import { supabase } from "@/lib/supabase";

const BANNER = require("../assets/images/marketplace-banner.png");
const LOGO = require("../assets/images/icon.png");

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("225") && digits.length === 13) return `+${digits}`;
  if (digits.length === 10) return `+225${digits}`;
  throw new Error("Saisissez un numéro ivoirien valide à 10 chiffres.");
}

function readableAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : "Connexion indisponible.";
  if (/phone.*(not.*enabled|disabled)|sms.*(not.*enabled|disabled)/i.test(message)) return "L’inscription par SMS est en cours d’activation. Aucun e-mail n’est demandé ; réessayez dès que le service SMS est disponible.";
  if (/rate limit/i.test(message)) return "Trop de demandes ont été envoyées. Attendez un instant avant de demander un nouveau code.";
  return message;
}

export function AuthGate({ children, accessOnly = false }: { children: React.ReactNode; accessOnly?: boolean }) {
  const { authenticated, authLoading, retryAuth } = useBusiness();
  const [showWelcome, setShowWelcome] = useState(!accessOnly);
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [firstName, setFirstName] = useState(""); const [lastName, setLastName] = useState(""); const [phone, setPhone] = useState(""); const [city, setCity] = useState("Abidjan"); const [code, setCode] = useState("");
  const [otpRequested, setOtpRequested] = useState(false); const [message, setMessage] = useState<string>(); const [busy, setBusy] = useState(false);
  const displayName = useMemo(() => `${firstName.trim()} ${lastName.trim()}`.trim(), [firstName, lastName]);

  useEffect(() => { if (accessOnly) return; const timer = setTimeout(() => setShowWelcome(false), 1450); return () => clearTimeout(timer); }, [accessOnly]);
  if (showWelcome) return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.welcome}><View style={styles.welcomeMark}><Image source={LOGO} style={styles.welcomeLogo} /></View><Text style={styles.welcomeBrand}>BUSINESS IVOIRE</Text><Text style={styles.welcomeTitle}>Bienvenue sur{`\n`}Business Ivoire</Text><Text style={styles.welcomeText}>Achetez. Vendez. Grandissez.</Text><ActivityIndicator color="#D5A72C" size="small" style={styles.welcomeSpinner} /></ScreenContainer>;
  if (authLoading) return <ScreenContainer style={styles.loading}><ActivityIndicator color="#D5A72C" size="large" /><Text style={styles.loadingText}>Ouverture de votre espace…</Text></ScreenContainer>;
  if (authenticated || !accessOnly) return <>{children}</>;

  const requestCode = async () => {
    try {
      const normalizedPhone = normalizePhone(phone);
      if (mode === "signup" && (!firstName.trim() || !lastName.trim() || !city.trim())) throw new Error("Indiquez votre prénom, votre nom et votre ville.");
      setBusy(true); setMessage(undefined);
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
        options: mode === "signup" ? { data: { first_name: firstName.trim(), last_name: lastName.trim(), display_name: displayName, city: city.trim(), phone: normalizedPhone } } : undefined,
      });
      if (error) throw error;
      setOtpRequested(true);
      setMessage(`Un code de vérification a été envoyé au ${normalizedPhone}.`);
    } catch (error) { setMessage(readableAuthError(error)); } finally { setBusy(false); }
  };

  const verifyCode = async () => {
    try {
      const normalizedPhone = normalizePhone(phone);
      if (!/^\d{6}$/.test(code.trim())) throw new Error("Saisissez le code SMS à 6 chiffres.");
      setBusy(true); setMessage(undefined);
      const { data, error } = await supabase.auth.verifyOtp({ phone: normalizedPhone, token: code.trim(), type: "sms" });
      if (error || !data.session) throw error ?? new Error("Le code n’a pas créé de session.");
      if (mode === "signup") await updateMyBusinessProfile({ displayName, location: city.trim(), phone: normalizedPhone });
      await retryAuth();
      router.replace("/selfie?required=1" as never);
    } catch (error) { setMessage(readableAuthError(error)); } finally { setBusy(false); }
  };

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}><ImageBackground source={BANNER} imageStyle={styles.backgroundImage} style={styles.hero}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View style={styles.mark}><MaterialIcons name="business-center" size={30} color="#FFFFFF" /></View><Text style={styles.eyebrow}>BUSINESS IVOIRE</Text><Text style={styles.title}>{otpRequested ? "Vérifiez votre numéro." : "Votre marché commence ici."}</Text><Text style={styles.text}>{otpRequested ? "Saisissez le code SMS. Votre selfie frontal sera demandé juste après pour sécuriser votre profil." : "Inscription par téléphone, sans e-mail ni mot de passe. Votre selfie direct devient votre photo de profil."}</Text><View style={styles.form}>{!otpRequested ? <><View style={styles.switcher}><TouchableOpacity onPress={() => { setMode("signup"); setMessage(undefined); }} style={[styles.switch, mode === "signup" && styles.switchActive]}><Text style={[styles.switchText, mode === "signup" && styles.switchTextActive]}>Créer un compte</Text></TouchableOpacity><TouchableOpacity onPress={() => { setMode("signin"); setMessage(undefined); }} style={[styles.switch, mode === "signin" && styles.switchActive]}><Text style={[styles.switchText, mode === "signin" && styles.switchTextActive]}>Se connecter</Text></TouchableOpacity></View>{mode === "signup" ? <><TextInput value={firstName} onChangeText={setFirstName} placeholder="Prénom" autoCapitalize="words" placeholderTextColor="#8D9B8E" style={styles.input} /><TextInput value={lastName} onChangeText={setLastName} placeholder="Nom" autoCapitalize="words" placeholderTextColor="#8D9B8E" style={styles.input} /><TextInput value={city} onChangeText={setCity} placeholder="Ville" autoCapitalize="words" placeholderTextColor="#8D9B8E" style={styles.input} /></> : null}<View style={styles.phoneInput}><Text style={styles.prefix}>+225</Text><TextInput value={phone} onChangeText={setPhone} placeholder="07 00 00 00 00" keyboardType="phone-pad" textContentType="telephoneNumber" placeholderTextColor="#8D9B8E" style={styles.phoneField} /></View><Text style={styles.phoneHint}>Votre numéro est vérifié par SMS et ne remplace pas votre accord avant tout contact.</Text><TouchableOpacity disabled={busy} style={[styles.button, busy && styles.disabled]} onPress={() => void requestCode()}><Text style={styles.buttonText}>{busy ? "Envoi du code…" : "Recevoir le code SMS"}</Text><MaterialIcons name="sms" size={18} color="#102015" /></TouchableOpacity></> : <><TextInput value={code} onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))} placeholder="Code à 6 chiffres" keyboardType="number-pad" textContentType="oneTimeCode" maxLength={6} placeholderTextColor="#8D9B8E" style={[styles.input, styles.codeInput]} /><TouchableOpacity disabled={busy} style={[styles.button, busy && styles.disabled]} onPress={() => void verifyCode()}><Text style={styles.buttonText}>{busy ? "Vérification…" : "Vérifier et prendre mon selfie"}</Text><MaterialIcons name="camera-front" size={18} color="#102015" /></TouchableOpacity><TouchableOpacity disabled={busy} onPress={() => { setOtpRequested(false); setCode(""); setMessage(undefined); }} style={styles.secondary}><Text style={styles.secondaryText}>Modifier mon numéro</Text></TouchableOpacity></>}{message ? <Text style={message.startsWith("Un code") ? styles.notice : styles.error}>{message}</Text> : null}</View></ScrollView></ImageBackground></ScreenContainer>;
}

const styles = StyleSheet.create({ welcome: { alignItems: "center", backgroundColor: "#07150B", justifyContent: "center", padding: 24 }, welcomeMark: { alignItems: "center", backgroundColor: "#173D24", borderColor: "#D5A72C", borderRadius: 28, borderWidth: 1, height: 64, justifyContent: "center", overflow: "hidden", width: 64 }, welcomeLogo: { height: 58, width: 58 }, welcomeBrand: { color: "#D5A72C", fontSize: 11, fontWeight: "900", letterSpacing: 2, marginTop: 20 }, welcomeTitle: { color: "#FFFFFF", fontSize: 31, fontWeight: "900", lineHeight: 37, marginTop: 10, textAlign: "center" }, welcomeText: { color: "#C9D5C9", fontSize: 14, fontWeight: "700", marginTop: 10 }, welcomeSpinner: { marginTop: 30 }, screen: { backgroundColor: "#07150B", padding: 16 }, hero: { borderRadius: 26, flex: 1, overflow: "hidden" }, backgroundImage: { opacity: 0.34 }, content: { backgroundColor: "rgba(7,21,11,0.74)", flexGrow: 1, justifyContent: "center", padding: 20 }, mark: { alignItems: "center", backgroundColor: "#176B35", borderColor: "#D5A72C", borderRadius: 22, borderWidth: 1, height: 48, justifyContent: "center", width: 48 }, eyebrow: { color: "#D5A72C", fontSize: 11, fontWeight: "900", letterSpacing: 1.7, marginTop: 16 }, title: { color: "#FFFFFF", fontSize: 30, fontWeight: "900", letterSpacing: -0.7, lineHeight: 35, marginTop: 7 }, text: { color: "#DCE7DB", fontSize: 13, lineHeight: 19, marginTop: 8 }, form: { backgroundColor: "#F7F4EA", borderRadius: 18, gap: 9, marginTop: 22, padding: 12 }, switcher: { backgroundColor: "#E5E2D4", borderRadius: 11, flexDirection: "row", padding: 3 }, switch: { alignItems: "center", borderRadius: 9, flex: 1, paddingVertical: 9 }, switchActive: { backgroundColor: "#176B35" }, switchText: { color: "#536158", fontSize: 11, fontWeight: "900" }, switchTextActive: { color: "#FFFFFF" }, input: { backgroundColor: "#FFFFFF", borderColor: "#DDD9CA", borderRadius: 11, borderWidth: 1, color: "#102015", fontSize: 13, minHeight: 45, paddingHorizontal: 11 }, phoneInput: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DDD9CA", borderRadius: 11, borderWidth: 1, flexDirection: "row", minHeight: 45, paddingLeft: 11 }, prefix: { borderRightColor: "#DDD9CA", borderRightWidth: 1, color: "#176B35", fontSize: 13, fontWeight: "900", paddingRight: 10 }, phoneField: { color: "#102015", flex: 1, fontSize: 13, minHeight: 45, paddingHorizontal: 11 }, phoneHint: { color: "#647067", fontSize: 10, lineHeight: 15, marginBottom: 2 }, codeInput: { fontSize: 20, fontWeight: "900", letterSpacing: 8, textAlign: "center" }, notice: { color: "#176B35", fontSize: 12, lineHeight: 16 }, error: { color: "#A1342C", fontSize: 12, lineHeight: 16 }, button: { alignItems: "center", backgroundColor: "#D5A72C", borderRadius: 12, flexDirection: "row", gap: 7, justifyContent: "center", minHeight: 48 }, disabled: { opacity: 0.65 }, buttonText: { color: "#102015", fontSize: 13, fontWeight: "900" }, secondary: { alignItems: "center", paddingVertical: 6 }, secondaryText: { color: "#176B35", fontSize: 12, fontWeight: "900" }, loading: { alignItems: "center", backgroundColor: "#07150B", justifyContent: "center" }, loadingText: { color: "#DCE7DB", fontSize: 14, fontWeight: "700", marginTop: 12 } });
