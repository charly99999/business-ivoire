import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useBusiness } from "@/lib/business-context";

type Step = "intro" | "camera" | "review";

export default function SelfieScreen() {
  const { setSelfie } = useBusiness();
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<Step>("intro");
  const [previewUri, setPreviewUri] = useState<string>();
  const [selfieData, setSelfieData] = useState<string>();
  const [ready, setReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const startCamera = async () => {
    const result = await requestPermission();
    if (result.granted) setStep("camera");
  };

  const takeSelfie = async () => {
    if (!ready || !cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.78, mirror: true, base64: true });
      if (photo?.uri && photo.base64) {
        setPreviewUri(photo.uri);
        setSelfieData(`data:image/jpeg;base64,${photo.base64}`);
        setStep("review");
      }
    } catch {
      Alert.alert("Capture indisponible", "La photo n’a pas pu être prise. Vérifiez l’autorisation de la caméra puis réessayez.");
    }
  };

  const confirmSelfie = async () => {
    if (!selfieData) return;
    try {
      await setSelfie(selfieData);
      Alert.alert("Selfie enregistré", "Votre photo prise en direct est désormais associée à votre profil.", [{ text: "Continuer", onPress: () => router.back() }]);
    } catch {
      Alert.alert("Enregistrement impossible", "La photo n’a pas pu être protégée sur le serveur. Vérifiez votre connexion puis réessayez.");
    }
  };

  if (step === "intro") {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.introScreen}>
        <TouchableOpacity accessibilityLabel="Fermer" activeOpacity={0.7} onPress={() => router.back()} style={styles.closeButton}><MaterialIcons name="close" size={24} color="#16202A" /></TouchableOpacity>
        <View style={styles.introContent}>
          <View style={styles.shield}><MaterialIcons name="verified-user" size={43} color="#0B6E8A" /></View>
          <Text style={styles.introTitle}>Une vraie personne, une communauté plus sûre</Text>
          <Text style={styles.introText}>Pour utiliser votre Page, Business Ivoire demande un selfie pris maintenant avec la caméra frontale. Vous ne pouvez pas choisir d’image depuis votre galerie.</Text>
          <View style={styles.ruleCard}><MaterialIcons name="camera-front" size={23} color="#0B6E8A" /><View style={styles.ruleCopy}><Text style={styles.ruleTitle}>Prise de vue en direct</Text><Text style={styles.ruleText}>La caméra s’ouvre uniquement lorsque vous l’autorisez.</Text></View></View>
          <View style={styles.ruleCard}><MaterialIcons name="lock-outline" size={23} color="#0B6E8A" /><View style={styles.ruleCopy}><Text style={styles.ruleTitle}>Finalité de sécurité</Text><Text style={styles.ruleText}>Cette version locale garde l’image sur votre appareil. Une version en production doit utiliser un stockage chiffré et des accès restreints.</Text></View></View>
        </View>
        <View style={styles.introFooter}><TouchableOpacity activeOpacity={0.78} onPress={startCamera} style={styles.cameraButton}><MaterialIcons name="camera-alt" size={21} color="#FFFFFF" /><Text style={styles.cameraButtonText}>Autoriser et prendre un selfie</Text></TouchableOpacity><Text style={styles.legalText}>En continuant, vous confirmez que cette photo est de vous.</Text></View>
      </ScreenContainer>
    );
  }

  if (!permission?.granted) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.deniedScreen}>
        <MaterialIcons name="no-photography" size={46} color="#E8752B" />
        <Text style={styles.deniedTitle}>Caméra requise</Text>
        <Text style={styles.deniedText}>Le selfie de vérification ne peut être pris qu’en direct. Autorisez la caméra dans les réglages de votre appareil puis réessayez.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={startCamera} activeOpacity={0.75}><Text style={styles.retryText}>Réessayer</Text></TouchableOpacity>
      </ScreenContainer>
    );
  }

  if (step === "review" && previewUri) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.reviewScreen}>
        <View style={styles.reviewHeader}><TouchableOpacity activeOpacity={0.7} onPress={() => setStep("camera")}><MaterialIcons name="arrow-back" size={25} color="#16202A" /></TouchableOpacity><Text style={styles.reviewTitle}>Vérifiez votre selfie</Text><View style={styles.headerSpace} /></View>
        <View style={styles.reviewContent}><Image source={{ uri: previewUri }} style={styles.preview} accessibilityLabel="Aperçu du selfie" /><Text style={styles.reviewText}>Assurez-vous que votre visage est net et bien éclairé. Cette photo deviendra votre image de profil dans cette version locale.</Text></View>
        <View style={styles.reviewFooter}><TouchableOpacity activeOpacity={0.75} onPress={() => setStep("camera")} style={styles.retakeButton}><MaterialIcons name="refresh" size={20} color="#0B6E8A" /><Text style={styles.retakeText}>Reprendre</Text></TouchableOpacity><TouchableOpacity activeOpacity={0.78} onPress={confirmSelfie} style={styles.confirmButton}><MaterialIcons name="check" size={20} color="#FFFFFF" /><Text style={styles.confirmText}>Confirmer</Text></TouchableOpacity></View>
      </ScreenContainer>
    );
  }

  return (
    <View style={styles.cameraScreen}>
      <CameraView ref={cameraRef} facing="front" style={StyleSheet.absoluteFill} mirror onCameraReady={() => setReady(true)} />
      <View style={styles.cameraOverlay}>
        <View style={styles.cameraHeader}><TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={styles.cameraClose}><MaterialIcons name="close" size={25} color="#FFFFFF" /></TouchableOpacity><Text style={styles.cameraTitle}>Cadrez votre visage</Text><View style={styles.headerSpace} /></View>
        <View style={styles.faceGuide}><View style={styles.guideOval} /><Text style={styles.guideText}>Placez votre visage dans le cercle</Text></View>
        <View style={styles.cameraFooter}><Text style={styles.cameraHint}>Pas de filtre. Pas de galerie. Une prise de vue en direct.</Text><TouchableOpacity accessibilityLabel="Prendre le selfie" activeOpacity={0.76} disabled={!ready} onPress={takeSelfie} style={[styles.shutter, !ready && styles.shutterDisabled]}><View style={styles.shutterInner} /></TouchableOpacity></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  introScreen: { backgroundColor: "#F7F5EF", paddingHorizontal: 22 },
  closeButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 18, height: 44, justifyContent: "center", position: "absolute", right: 18, top: 16, width: 44 },
  introContent: { flex: 1, justifyContent: "center", paddingTop: 28 },
  shield: { alignItems: "center", backgroundColor: "#E2F2F6", borderRadius: 33, height: 66, justifyContent: "center", width: 66 },
  introTitle: { color: "#16202A", fontSize: 29, fontWeight: "900", letterSpacing: -0.7, lineHeight: 36, marginTop: 22 },
  introText: { color: "#475467", fontSize: 15, lineHeight: 23, marginTop: 14 },
  ruleCard: { alignItems: "flex-start", backgroundColor: "#FFFFFF", borderColor: "#E7E5DE", borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, marginTop: 14, padding: 14 },
  ruleCopy: { flex: 1 },
  ruleTitle: { color: "#16202A", fontSize: 14, fontWeight: "900" },
  ruleText: { color: "#667085", fontSize: 12, lineHeight: 18, marginTop: 3 },
  introFooter: { gap: 12, paddingBottom: 10 },
  cameraButton: { alignItems: "center", backgroundColor: "#0B6E8A", borderRadius: 16, flexDirection: "row", gap: 9, justifyContent: "center", minHeight: 54 },
  cameraButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  legalText: { color: "#7A858F", fontSize: 11, lineHeight: 16, textAlign: "center" },
  deniedScreen: { alignItems: "center", backgroundColor: "#F7F5EF", justifyContent: "center", paddingHorizontal: 28 },
  deniedTitle: { color: "#16202A", fontSize: 22, fontWeight: "900", marginTop: 14 },
  deniedText: { color: "#667085", fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: "center" },
  retryButton: { backgroundColor: "#E2F2F6", borderRadius: 13, marginTop: 20, paddingHorizontal: 17, paddingVertical: 12 },
  retryText: { color: "#0B6E8A", fontWeight: "900" },
  reviewScreen: { backgroundColor: "#F7F5EF", paddingHorizontal: 18 },
  reviewHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 },
  reviewTitle: { color: "#16202A", fontSize: 17, fontWeight: "900" },
  headerSpace: { width: 25 },
  reviewContent: { flex: 1, justifyContent: "center" },
  preview: { alignSelf: "center", borderRadius: 24, height: 330, resizeMode: "cover", width: "100%" },
  reviewText: { color: "#667085", fontSize: 14, lineHeight: 20, marginTop: 16, textAlign: "center" },
  reviewFooter: { flexDirection: "row", gap: 10, paddingBottom: 10 },
  retakeButton: { alignItems: "center", backgroundColor: "#E2F2F6", borderRadius: 15, flex: 1, flexDirection: "row", gap: 7, justifyContent: "center", minHeight: 52 },
  retakeText: { color: "#0B6E8A", fontSize: 14, fontWeight: "900" },
  confirmButton: { alignItems: "center", backgroundColor: "#0B6E8A", borderRadius: 15, flex: 1, flexDirection: "row", gap: 7, justifyContent: "center", minHeight: 52 },
  confirmText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  cameraScreen: { backgroundColor: "#16202A", flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: "space-between" },
  cameraHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 58 },
  cameraClose: { alignItems: "center", backgroundColor: "rgba(22,32,42,0.48)", borderRadius: 18, height: 44, justifyContent: "center", width: 44 },
  cameraTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  faceGuide: { alignItems: "center", flex: 1, justifyContent: "center" },
  guideOval: { borderColor: "rgba(255,255,255,0.9)", borderRadius: 150, borderWidth: 3, height: 285, width: 230 },
  guideText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800", marginTop: 20, textShadowColor: "#16202A", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  cameraFooter: { alignItems: "center", gap: 17, paddingBottom: 45 },
  cameraHint: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", textAlign: "center" },
  shutter: { alignItems: "center", borderColor: "#FFFFFF", borderRadius: 40, borderWidth: 4, height: 72, justifyContent: "center", width: 72 },
  shutterDisabled: { opacity: 0.45 },
  shutterInner: { backgroundColor: "#FFFFFF", borderRadius: 28, height: 56, width: 56 },
});
