import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useWindowDimensions, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useBusiness } from "@/lib/business-context";
import { formatFcfa } from "@/lib/marketplace";
import { resolveMediaUrl } from "@/lib/media";
import { trpc } from "@/lib/trpc";

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { width } = useWindowDimensions(); const { authenticated, currentUserId } = useBusiness();
  const listing = trpc.marketplace.publicById.useQuery({ id: Number(id) });
  const favorite = trpc.marketplace.toggleFavorite.useMutation({ onSuccess: () => void listing.refetch() });
  const conversation = trpc.conversations.createDirect.useMutation({ onSuccess: (item) => router.push(`/conversation/${item.id}` as never) });
  if (!listing.data) return <ScreenContainer style={s.loading}><Text style={s.loadingText}>{listing.isLoading ? "Chargement de l’annonce…" : "Annonce introuvable"}</Text></ScreenContainer>;
  const item = listing.data; const isOwnListing = Boolean(item.seller && item.seller.userId === currentUserId);
  const openAccess = () => router.push("/access" as never);
  const contactSeller = () => {
    if (!authenticated) return openAccess();
    if (isOwnListing) return Alert.alert("Votre annonce", "Vous ne pouvez pas vous écrire à vous-même.");
    if (item.seller) void conversation.mutateAsync({ userId: item.seller.userId });
  };
  return <ScreenContainer style={s.screen}><FlatList data={item.images} horizontal pagingEnabled keyExtractor={(image) => String(image.id)} renderItem={({ item: image }) => <Image source={{ uri: resolveMediaUrl(image.url) }} style={[s.image, { width }]} />} ListEmptyComponent={<View style={[s.emptyImage, { width }]}><MaterialIcons name="photo-library" size={42} color="#D5A72C" /></View>} ListFooterComponent={<View style={s.body}><View style={s.row}><Text style={s.category}>{item.category}</Text><TouchableOpacity onPress={() => authenticated ? void favorite.mutateAsync({ listingId: item.id }) : openAccess()}><MaterialIcons name="favorite-border" size={25} color="#176B35" /></TouchableOpacity></View><Text style={s.title}>{item.title}</Text><Text style={s.price}>{formatFcfa(item.price)}</Text><Text style={s.meta}>{item.location} · {item.condition === "new" ? "Neuf" : item.condition === "service" ? "Service" : "Occasion"}</Text><Text style={s.description}>{item.description}</Text><TouchableOpacity disabled={!item.seller || conversation.isPending} onPress={contactSeller} style={[s.contact, (!item.seller || conversation.isPending) && s.disabled]}><MaterialIcons name="chat-bubble-outline" size={19} color="#102015" /><Text style={s.contactText}>{isOwnListing ? "Votre annonce" : conversation.isPending ? "Ouverture…" : "Écrire au vendeur"}</Text></TouchableOpacity></View>} /></ScreenContainer>;
}
const s = StyleSheet.create({ screen:{backgroundColor:"#F7F4EA"}, loading:{alignItems:"center",backgroundColor:"#F7F4EA",justifyContent:"center"},loadingText:{color:"#647067"}, image:{height:290},emptyImage:{alignItems:"center",backgroundColor:"#173D24",height:290,justifyContent:"center"},body:{padding:18},row:{alignItems:"center",flexDirection:"row",justifyContent:"space-between"},category:{color:"#176B35",fontSize:12,fontWeight:"900"},title:{color:"#102015",fontSize:25,fontWeight:"900",marginTop:10},price:{color:"#176B35",fontSize:22,fontWeight:"900",marginTop:10},meta:{color:"#647067",fontSize:13,marginTop:6},description:{color:"#344238",fontSize:15,lineHeight:22,marginTop:20},contact:{alignItems:"center",backgroundColor:"#D5A72C",borderRadius:14,flexDirection:"row",gap:8,justifyContent:"center",marginTop:24,paddingVertical:15},disabled:{opacity:.58},contactText:{color:"#102015",fontSize:15,fontWeight:"900"} });
