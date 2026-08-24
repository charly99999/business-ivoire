import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { AccessRequiredState } from "@/components/access-required-state";
import { useBusiness } from "@/lib/business-context";
import { imageUriToDataUri } from "@/lib/media";

export default function CreatePostScreen() {
  const { authenticated, identityVerified, publishPost } = useBusiness();
  const [body, setBody] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [sending, setSending] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [4, 3], quality: 0.74 });
    if (!result.canceled) setImageUri(result.assets[0]?.uri);
  };

  const submit = async () => {
    if (!authenticated) { Alert.alert("Connexion requise", "Connectez-vous pour publier une actualité."); return; }
    if (!identityVerified) { Alert.alert("Selfie requis", "Prenez votre selfie direct avant de publier.", [{ text: "Ouvrir le selfie", onPress: () => router.push("/selfie" as never) }]); return; }
    try { setSending(true); await publishPost(body, "Opportunité", imageUri ? await imageUriToDataUri(imageUri) : undefined); router.back(); }
    catch (error) { Alert.alert("Publication impossible", error instanceof Error ? error.message : "Réessayez dans un instant."); }
    finally { setSending(false); }
  };

  if (!authenticated) return <ScreenContainer style={s.screen}><AccessRequiredState title="Partagez après votre inscription" description="Connectez-vous avec votre numéro pour publier une actualité visible par la communauté." /></ScreenContainer>;
  if (!identityVerified) return <ScreenContainer style={s.screen}><AccessRequiredState title="Selfie requis avant publication" description="Votre selfie frontal direct doit être enregistré avant de publier une actualité communautaire." actionLabel="Prendre mon selfie" destination="/selfie" /></ScreenContainer>;

  return <ScreenContainer style={s.screen}><View style={s.top}><TouchableOpacity onPress={() => router.back()} style={s.back}><MaterialIcons name="arrow-back" size={22} color="#F7F4EA" /></TouchableOpacity><Text style={s.title}>Nouvelle actualité</Text><View style={s.spacer} /></View><View style={s.content}><Text style={s.label}>Partagez une information utile</Text><Text style={s.copy}>Vos publications sont visibles par la communauté Business Ivoire. Le selfie direct est obligatoire pour protéger les échanges.</Text><TextInput accessibilityLabel="Contenu de l’actualité" value={body} onChangeText={setBody} placeholder="Écrivez votre actualité, opportunité ou conseil…" placeholderTextColor="#77847B" multiline maxLength={3000} style={s.input} textAlignVertical="top" /><Text style={s.counter}>{body.trim().length}/3000</Text>{imageUri ? <View style={s.previewWrap}><Image source={{ uri: imageUri }} style={s.preview} /><TouchableOpacity onPress={() => setImageUri(undefined)} style={s.removeImage}><MaterialIcons name="close" size={17} color="#FFF" /></TouchableOpacity></View> : <TouchableOpacity onPress={() => void pickImage()} style={s.mediaButton}><MaterialIcons name="add-photo-alternate" size={20} color="#176B35" /><Text style={s.mediaText}>Ajouter une image</Text><Text style={s.optional}>Facultatif</Text></TouchableOpacity>}<TouchableOpacity disabled={sending || !body.trim()} onPress={() => void submit()} style={[s.button, (sending || !body.trim()) && s.disabled]}><MaterialIcons name="send" size={18} color="#102015" /><Text style={s.buttonText}>{sending ? "Publication…" : "Publier l’actualité"}</Text></TouchableOpacity></View></ScreenContainer>;
}

const s = StyleSheet.create({ screen:{backgroundColor:"#F7F4EA"},top:{alignItems:"center",backgroundColor:"#07150B",flexDirection:"row",justifyContent:"space-between",padding:16},back:{padding:4},title:{color:"#F7F4EA",fontSize:17,fontWeight:"900"},spacer:{width:30},content:{gap:12,padding:20},label:{color:"#102015",fontSize:21,fontWeight:"900"},copy:{color:"#58675C",fontSize:13,lineHeight:19},input:{backgroundColor:"#FFF",borderColor:"#DFDBCF",borderRadius:16,borderWidth:1,color:"#102015",fontSize:15,minHeight:190,padding:14},counter:{alignSelf:"flex-end",color:"#77847B",fontSize:11,fontWeight:"700"},mediaButton:{alignItems:"center",backgroundColor:"#EDF5EB",borderColor:"#B8D5BA",borderRadius:13,borderStyle:"dashed",borderWidth:1,flexDirection:"row",gap:8,justifyContent:"center",minHeight:52,paddingHorizontal:12},mediaText:{color:"#176B35",fontSize:13,fontWeight:"900"},optional:{color:"#77847B",fontSize:11,fontWeight:"700",marginLeft:"auto"},previewWrap:{height:160,position:"relative"},preview:{borderRadius:13,height:"100%",width:"100%"},removeImage:{alignItems:"center",backgroundColor:"rgba(0,0,0,.7)",borderRadius:15,height:30,justifyContent:"center",position:"absolute",right:9,top:9,width:30},button:{alignItems:"center",backgroundColor:"#D5A72C",borderRadius:13,flexDirection:"row",gap:8,justifyContent:"center",padding:15},disabled:{opacity:.45},buttonText:{color:"#102015",fontSize:14,fontWeight:"900"} });
