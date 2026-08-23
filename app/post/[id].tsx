import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Avatar, Card } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";
import { relativeTime, useBusiness } from "@/lib/business-context";
import { createSupabasePostComment, fetchSupabasePostComments, type SocialComment } from "@/lib/supabase-social";

export default function PostCommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Array.isArray(id) ? id[0] : id;
  const { authenticated, identityVerified } = useBusiness();
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => { if (!postId) return; try { setLoading(true); setComments(await fetchSupabasePostComments(postId)); } catch { Alert.alert("Commentaires indisponibles", "Réessayez dans un instant."); } finally { setLoading(false); } }, [postId]);
  useEffect(() => { void load(); }, [load]);
  const submit = async () => {
    if (!authenticated) { Alert.alert("Connexion requise", "Connectez-vous pour commenter."); return; }
    if (!identityVerified) { Alert.alert("Selfie requis", "Prenez votre selfie direct avant de commenter.", [{ text: "Ouvrir le selfie", onPress: () => router.push("/selfie" as never) }]); return; }
    if (!postId) return;
    try { setSending(true); await createSupabasePostComment(postId, body); setBody(""); await load(); }
    catch (error) { Alert.alert("Commentaire impossible", error instanceof Error ? error.message : "Réessayez dans un instant."); }
    finally { setSending(false); }
  };

  return <ScreenContainer style={s.screen}><View style={s.top}><TouchableOpacity onPress={() => router.back()} style={s.back}><MaterialIcons name="arrow-back" size={22} color="#F7F4EA" /></TouchableOpacity><Text style={s.title}>Commentaires</Text><View style={s.spacer} /></View><FlatList data={comments} keyExtractor={(item) => item.id} contentContainerStyle={s.list} refreshing={loading} onRefresh={() => void load()} ListEmptyComponent={<View style={s.empty}><MaterialIcons name="forum" size={30} color="#D5A72C" /><Text style={s.emptyTitle}>Pas encore de commentaire</Text><Text style={s.emptyCopy}>Lancez la discussion avec un retour utile et respectueux.</Text></View>} renderItem={({ item }) => <Card style={s.comment}><Avatar initials={item.author.slice(0, 2).toUpperCase()} uri={item.avatar} /><View style={s.commentCopy}><Text style={s.name}>{item.author}</Text><Text style={s.time}>{relativeTime(item.createdAt)}</Text><Text style={s.body}>{item.body}</Text></View></Card>} ListFooterComponent={<View style={s.composer}><TextInput value={body} onChangeText={setBody} placeholder="Écrire un commentaire…" placeholderTextColor="#77847B" multiline maxLength={1200} style={s.input} textAlignVertical="top" /><TouchableOpacity disabled={sending || !body.trim()} onPress={() => void submit()} style={[s.send, (sending || !body.trim()) && s.disabled]}><MaterialIcons name="send" size={19} color="#102015" /></TouchableOpacity></View>} /></ScreenContainer>;
}

const s = StyleSheet.create({ screen:{backgroundColor:"#F7F4EA"},top:{alignItems:"center",backgroundColor:"#07150B",flexDirection:"row",justifyContent:"space-between",padding:16},back:{padding:4},title:{color:"#F7F4EA",fontSize:17,fontWeight:"900"},spacer:{width:30},list:{gap:10,padding:16,paddingBottom:32},comment:{alignItems:"flex-start",flexDirection:"row",gap:10,padding:13},commentCopy:{flex:1},name:{color:"#27392D",fontSize:13,fontWeight:"900"},time:{color:"#77847B",fontSize:10,fontWeight:"700",marginTop:2},body:{color:"#38483D",fontSize:13,lineHeight:19,marginTop:8},empty:{alignItems:"center",gap:7,padding:30},emptyTitle:{color:"#102015",fontSize:16,fontWeight:"900"},emptyCopy:{color:"#667085",fontSize:12,lineHeight:18,textAlign:"center"},composer:{alignItems:"flex-end",backgroundColor:"#FFF",borderColor:"#DFDBCF",borderRadius:15,borderWidth:1,flexDirection:"row",gap:8,marginTop:8,padding:9},input:{color:"#102015",flex:1,fontSize:14,maxHeight:110,minHeight:42,paddingHorizontal:6,paddingVertical:8},send:{alignItems:"center",backgroundColor:"#D5A72C",borderRadius:12,height:42,justifyContent:"center",width:42},disabled:{opacity:.45} });
