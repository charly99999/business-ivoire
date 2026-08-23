import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useBusiness } from "@/lib/business-context";

type Step = "intro" | "camera" | "review" | "web-preview";

export default function SelfieScreen() {
  const { setSelfie } = useBusiness();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<Step>("intro");
  const [previewUri, setPreviewUri] = useState<string>();
  const [selfieData, setSelfieData] = useState<string>();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cameraError, setCameraError] = useState<string>();
  const [cameraAuthorized, setCameraAuthorized] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (permission?.granted) setCameraAuthorized(true);
  }, [permission?.granted]);

  const startCamera = async () => {
    try {
      const result = await requestPermission();
      if (result.granted) {
        setCameraAuthorized(true);
        setCameraError(undefined);
        setReady(false);
        setStep("camera");
      } else {
        setCameraAuthorized(false);
        Alert.alert("Caméra requise", "Le selfie de vérification doit être pris en direct avec la caméra frontale. Autorisez la caméra dans les réglages de votre iPhone puis réessayez.");
      }
    } catch {
      Alert.alert("Autorisation indisponible", "La demande d’accès à la caméra a échoué. Réessayez depuis les réglages de votre appareil.");
    }
  };

  const takeSelfie = async () => {
    if (!ready || !cameraRef.current || busy) return;
    try {
      setBusy(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.76, mirror: true, base64: true, skipProcessing: false });
      if (!photo?.uri || !photo.base64) throw new Error("capture_incomplete");
      setPreviewUri(photo.uri);
      setSelfieData(`data:image/jpeg;base64,${photo.base64}`);
      setStep("review");
    } catch {
      Alert.alert("Capture indisponible", "La photo n’a pas pu être prise. Vérifiez la caméra frontale puis réessayez.");
    } finally {
      setBusy(false);
    }
  };

  const confirmSelfie = async () => {
    if (!selfieData || busy) return;
    try {
      setBusy(true);
      await setSelfie(selfieData);
      Alert.alert("Selfie enregistré", "Votre profil vendeur est maintenant vérifié. Vous pouvez publier votre annonce.", [{ text: "Continuer", onPress: () => returnTo === "create" ? router.replace("/create" as never) : router.back() }]);
    } catch {
      Alert.alert("Enregistrement impossible", "Votre selfie n’a pas pu être sauvegardé. Vérifiez votre connexion puis réessayez : votre photo reste disponible pour une nouvelle tentative.");
    } finally {
      setBusy(false);
    }
  };

  if (step === "intro") return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.introScreen}><TouchableOpacity accessibilityLabel="Fermer" onPress={() => router.back()} style={styles.closeButton}><MaterialIcons name="close" size={24} color="#102015" /></TouchableOpacity><View style={styles.introContent}><View style={styles.shield}><MaterialIcons name="verified-user" size={43} color="#D5A72C" /></View><Text style={styles.introTitle}>Vérifiez votre identité</Text><Text style={styles.introText}>Avant de publier, prenez un selfie en direct avec la caméra frontale. Il sera associé à votre profil vendeur afin de renforcer la confiance et de faciliter le traitement des signalements.</Text><View style={styles.ruleCard}><MaterialIcons name="camera-front" size={23} color="#176B35" /><View style={styles.ruleCopy}><Text style={styles.ruleTitle}>Caméra frontale obligatoire</Text><Text style={styles.ruleText}>Le selfie est pris maintenant, en direct. La galerie n’est jamais accessible depuis cet écran.</Text></View></View><View style={styles.ruleCard}><MaterialIcons name="lock-outline" size={23} color="#176B35" /><View style={styles.ruleCopy}><Text style={styles.ruleTitle}>Utilisation limitée</Text><Text style={styles.ruleText}>Le selfie sert à identifier le vendeur en cas de contrôle ou de signalement.</Text></View></View></View><View style={styles.introFooter}><TouchableOpacity disabled={busy} onPress={Platform.OS === "web" ? () => setStep("web-preview") : startCamera} style={[styles.cameraButton, busy && styles.disabled]}><MaterialIcons name="camera-front" size={21} color="#FFFFFF" /><Text style={styles.cameraButtonText}>Ouvrir la caméra frontale</Text></TouchableOpacity><Text style={styles.legalText}>En continuant, vous confirmez que cette photo est de vous.</Text></View></ScreenContainer>;

  if (step === "web-preview") return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.deniedScreen}><MaterialIcons name="phone-iphone" size={48} color="#D5A72C" /><Text style={styles.deniedTitle}>Selfie à faire sur iPhone</Text><Text style={styles.deniedText}>L’aperçu intégré à cette conversation ne peut pas ouvrir la caméra matérielle. Le selfie reste obligatoirement direct, sans galerie : ouvrez Business Ivoire dans Expo Go ou dans sa version iPhone pour utiliser la caméra frontale.</Text><TouchableOpacity style={styles.retryButton} onPress={() => setStep("intro")}><Text style={styles.retryText}>Revenir</Text></TouchableOpacity></ScreenContainer>;

  if (!cameraAuthorized) return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.deniedScreen}><MaterialIcons name="no-photography" size={46} color="#D5A72C" /><Text style={styles.deniedTitle}>Caméra requise</Text><Text style={styles.deniedText}>Le selfie ne peut pas venir de la galerie. Autorisez la caméra dans les réglages de votre iPhone, puis prenez votre visage en direct.</Text><TouchableOpacity style={styles.retryButton} onPress={startCamera}><Text style={styles.retryText}>Autoriser la caméra</Text></TouchableOpacity></ScreenContainer>;

  if (step === "review" && previewUri) return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.reviewScreen}><View style={styles.reviewHeader}><TouchableOpacity onPress={() => setStep("camera")}><MaterialIcons name="arrow-back" size={25} color="#102015" /></TouchableOpacity><Text style={styles.reviewTitle}>Vérifiez votre selfie</Text><View style={styles.headerSpace} /></View><View style={styles.reviewContent}><Image source={{ uri: previewUri }} style={styles.preview} accessibilityLabel="Aperçu du selfie direct" /><Text style={styles.reviewText}>Assurez-vous que votre visage est net et bien éclairé. Cette photo prise en direct sera reliée à votre profil vendeur.</Text></View><View style={styles.reviewFooter}><TouchableOpacity disabled={busy} onPress={() => setStep("camera")} style={styles.retakeButton}><MaterialIcons name="refresh" size={20} color="#176B35" /><Text style={styles.retakeText}>Reprendre</Text></TouchableOpacity><TouchableOpacity disabled={busy} onPress={confirmSelfie} style={[styles.confirmButton, busy && styles.disabled]}><MaterialIcons name="check" size={20} color="#FFFFFF" /><Text style={styles.confirmText}>{busy ? "Enregistrement…" : "Confirmer"}</Text></TouchableOpacity></View></ScreenContainer>;

  if (cameraError) return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.deniedScreen}><MaterialIcons name="camera-alt" size={46} color="#D5A72C" /><Text style={styles.deniedTitle}>Caméra indisponible</Text><Text style={styles.deniedText}>{cameraError} Le selfie doit être fait dans l’application avec la caméra frontale d’un iPhone.</Text><TouchableOpacity style={styles.retryButton} onPress={startCamera}><Text style={styles.retryText}>Réessayer</Text></TouchableOpacity></ScreenContainer>;

  return <View style={styles.cameraScreen}><CameraView ref={cameraRef} facing="front" style={StyleSheet.absoluteFill} mirror onCameraReady={() => setReady(true)} onMountError={(error) => setCameraError(error.message || "La caméra frontale n’est pas disponible sur cet appareil.")} /><View style={styles.cameraOverlay}><View style={styles.cameraHeader}><TouchableOpacity onPress={() => router.back()} style={styles.cameraClose}><MaterialIcons name="close" size={25} color="#FFFFFF" /></TouchableOpacity><Text style={styles.cameraTitle}>Cadrez votre vrai visage</Text><View style={styles.headerSpace} /></View><View style={styles.faceGuide}><View style={styles.guideOval} /><Text style={styles.guideText}>Placez votre visage dans le cercle</Text></View><View style={styles.cameraFooter}><Text style={styles.cameraHint}>Caméra frontale uniquement. Pas de filtre. Pas de galerie.</Text><TouchableOpacity accessibilityLabel="Prendre le selfie direct" disabled={!ready || busy} onPress={takeSelfie} style={[styles.shutter, (!ready || busy) && styles.shutterDisabled]}><View style={styles.shutterInner} /></TouchableOpacity></View></View></View>;
}

const styles = StyleSheet.create({ introScreen:{backgroundColor:"#F7F4EA",paddingHorizontal:22}, closeButton:{alignItems:"center",backgroundColor:"#FFFFFF",borderRadius:18,height:44,justifyContent:"center",position:"absolute",right:18,top:16,width:44}, introContent:{flex:1,justifyContent:"center",paddingTop:28}, shield:{alignItems:"center",backgroundColor:"#173D24",borderRadius:33,height:66,justifyContent:"center",width:66}, introTitle:{color:"#102015",fontSize:29,fontWeight:"900",letterSpacing:-.7,lineHeight:36,marginTop:22}, introText:{color:"#475467",fontSize:15,lineHeight:23,marginTop:14}, ruleCard:{alignItems:"flex-start",backgroundColor:"#FFFFFF",borderColor:"#E7E5DE",borderRadius:16,borderWidth:1,flexDirection:"row",gap:12,marginTop:14,padding:14}, ruleCopy:{flex:1}, ruleTitle:{color:"#102015",fontSize:14,fontWeight:"900"}, ruleText:{color:"#667085",fontSize:12,lineHeight:18,marginTop:3}, introFooter:{gap:12,paddingBottom:10}, cameraButton:{alignItems:"center",backgroundColor:"#176B35",borderRadius:16,flexDirection:"row",gap:9,justifyContent:"center",minHeight:54}, cameraButtonText:{color:"#FFFFFF",fontSize:15,fontWeight:"900"}, legalText:{color:"#7A858F",fontSize:11,lineHeight:16,textAlign:"center"}, deniedScreen:{alignItems:"center",backgroundColor:"#F7F4EA",justifyContent:"center",paddingHorizontal:28}, deniedTitle:{color:"#102015",fontSize:22,fontWeight:"900",marginTop:14}, deniedText:{color:"#667085",fontSize:14,lineHeight:21,marginTop:8,textAlign:"center"}, retryButton:{backgroundColor:"#E9F5EC",borderRadius:13,marginTop:20,paddingHorizontal:17,paddingVertical:12}, retryText:{color:"#176B35",fontWeight:"900"}, reviewScreen:{backgroundColor:"#F7F4EA",paddingHorizontal:18}, reviewHeader:{alignItems:"center",flexDirection:"row",justifyContent:"space-between",paddingVertical:12}, reviewTitle:{color:"#102015",fontSize:17,fontWeight:"900"}, headerSpace:{width:25}, reviewContent:{flex:1,justifyContent:"center"}, preview:{alignSelf:"center",borderRadius:24,height:330,resizeMode:"cover",width:"100%"}, reviewText:{color:"#667085",fontSize:14,lineHeight:20,marginTop:16,textAlign:"center"}, reviewFooter:{flexDirection:"row",gap:10,paddingBottom:10}, retakeButton:{alignItems:"center",backgroundColor:"#E9F5EC",borderRadius:15,flex:1,flexDirection:"row",gap:7,justifyContent:"center",minHeight:52}, retakeText:{color:"#176B35",fontSize:14,fontWeight:"900"}, confirmButton:{alignItems:"center",backgroundColor:"#176B35",borderRadius:15,flex:1,flexDirection:"row",gap:7,justifyContent:"center",minHeight:52}, confirmText:{color:"#FFFFFF",fontSize:14,fontWeight:"900"}, disabled:{opacity:.55}, cameraScreen:{backgroundColor:"#102015",flex:1}, cameraOverlay:{flex:1,justifyContent:"space-between"}, cameraHeader:{alignItems:"center",flexDirection:"row",justifyContent:"space-between",paddingHorizontal:18,paddingTop:58}, cameraClose:{alignItems:"center",backgroundColor:"rgba(16,32,21,.48)",borderRadius:18,height:44,justifyContent:"center",width:44}, cameraTitle:{color:"#FFFFFF",fontSize:17,fontWeight:"900"}, faceGuide:{alignItems:"center",flex:1,justifyContent:"center"}, guideOval:{borderColor:"rgba(255,255,255,.9)",borderRadius:150,borderWidth:3,height:285,width:230}, guideText:{color:"#FFFFFF",fontSize:14,fontWeight:"800",marginTop:20}, cameraFooter:{alignItems:"center",gap:17,paddingBottom:45}, cameraHint:{color:"#FFFFFF",fontSize:12,fontWeight:"700",textAlign:"center"}, shutter:{alignItems:"center",borderColor:"#FFFFFF",borderRadius:40,borderWidth:4,height:72,justifyContent:"center",width:72}, shutterDisabled:{opacity:.45}, shutterInner:{backgroundColor:"#FFFFFF",borderRadius:28,height:56,width:56} });
