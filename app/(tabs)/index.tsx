import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ActionIcon, Avatar, Card, SectionTitle, Tag } from "@/components/business-ui";
import { ScreenContainer } from "@/components/screen-container";
import { useBusiness, type FeedPost } from "@/lib/business-context";
import { trpc } from "@/lib/trpc";

const stories = [
  { id: "your", label: "Votre story", initials: "BI", color: "#0B6E8A", mine: true },
  { id: "aicha", label: "Aïcha", initials: "AK", color: "#E8752B" },
  { id: "kader", label: "Kader", initials: "KT", color: "#1D8A5B" },
  { id: "maeva", label: "Maeva", initials: "MN", color: "#805AD5" },
  { id: "yao", label: "Yao", initials: "YD", color: "#C05621" },
];

function StoryStrip() {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.storyList}
      data={stories}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity activeOpacity={0.76} style={styles.story} onPress={() => router.push("/profile" as never)}>
          <View style={[styles.storyRing, { borderColor: item.color }]}>
            <Avatar initials={item.initials} size="md" color={item.color} />
            {item.mine ? <View style={styles.storyAdd}><MaterialIcons name="add" size={14} color="#FFFFFF" /></View> : null}
          </View>
          <Text numberOfLines={1} style={styles.storyName}>{item.label}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

function FeedCard({ post }: { post: FeedPost }) {
  const { toggleReaction } = useBusiness();
  const utils = trpc.useUtils();
  const [showComments, setShowComments] = useState(false);
  const [draftComment, setDraftComment] = useState("");
  const commentsQuery = trpc.feed.comments.useQuery({ postId: post.id }, { enabled: showComments });
  const commentMutation = trpc.feed.comment.useMutation({ onSuccess: async () => { setDraftComment(""); await Promise.all([utils.feed.comments.invalidate({ postId: post.id }), utils.feed.list.invalidate()]); } });
  const tint = post.tag === "Immobilier" ? "blue" : post.tag === "Entrepreneuriat" ? "orange" : "green";
  const sendComment = async () => {
    const body = draftComment.trim();
    if (!body) return;
    await commentMutation.mutateAsync({ postId: post.id, body });
  };
  return (
    <Card style={styles.postCard}>
      <View style={styles.postHeader}>
        <Avatar initials={post.avatar} color={post.tag === "Immobilier" ? "#0B6E8A" : "#E8752B"} />
        <View style={styles.postIdentity}>
          <Text style={styles.postAuthor}>{post.author}</Text>
          <Text style={styles.postMeta}>{post.role} · {post.publishedAt}</Text>
          <Text style={styles.postLocation}>{post.place}</Text>
        </View>
        <MaterialIcons name="more-horiz" size={24} color="#667085" />
      </View>
      <View style={styles.tagWrap}><Tag label={post.tag} tint={tint} /></View>
      <Text style={styles.postText}>{post.text}</Text>
      {post.image ? <Image source={{ uri: post.image }} style={styles.postImage} accessibilityLabel="Illustration de la publication" /> : null}
      <View style={styles.engagementInfo}>
        <View style={styles.reactionCluster}><View style={styles.smallReaction}><MaterialIcons name="thumb-up" size={11} color="#FFFFFF" /></View><Text style={styles.engagementText}>{post.reactions}</Text></View>
        <Text style={styles.engagementText}>{post.comments} commentaires</Text>
      </View>
      <View style={styles.postActions}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => toggleReaction(post.id)} style={styles.postAction}><MaterialIcons name={post.reacted ? "thumb-up" : "thumb-up-off-alt"} size={20} color={post.reacted ? "#0B6E8A" : "#667085"} /><Text style={[styles.postActionText, post.reacted && styles.activeAction]}>J’aime</Text></TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} onPress={() => setShowComments((visible) => !visible)} style={styles.postAction}><MaterialIcons name="chat-bubble-outline" size={20} color="#667085" /><Text style={styles.postActionText}>Commenter</Text></TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/messages" as never)} style={styles.postAction}><MaterialIcons name="send" size={20} color="#667085" /><Text style={styles.postActionText}>Partager</Text></TouchableOpacity>
      </View>
      {showComments ? <View style={styles.commentsPanel}><Text style={styles.commentsHeading}>Commentaires</Text>{(commentsQuery.data ?? []).slice(0, 4).map((comment) => <View key={comment.id} style={styles.comment}><Avatar initials={comment.author.displayName.slice(0, 2).toUpperCase()} size="sm" color="#E8752B" /><View style={styles.commentBubble}><Text style={styles.commentAuthor}>{comment.author.displayName}</Text><Text style={styles.commentBody}>{comment.body}</Text></View></View>)}{commentsQuery.data?.length === 0 ? <Text style={styles.noComments}>Soyez la première personne à répondre.</Text> : null}<View style={styles.commentComposer}><TextInput value={draftComment} onChangeText={setDraftComment} placeholder="Écrire un commentaire…" placeholderTextColor="#98A2B3" returnKeyType="send" onSubmitEditing={() => void sendComment()} style={styles.commentInput} /><TouchableOpacity accessibilityLabel="Envoyer le commentaire" onPress={() => void sendComment()} activeOpacity={0.72} style={styles.commentSend}><MaterialIcons name="send" size={17} color="#FFFFFF" /></TouchableOpacity></View></View> : null}
    </Card>
  );
}

export default function HomeScreen() {
  const { posts, profile } = useBusiness();
  return (
    <ScreenContainer style={styles.screen}>
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <FeedCard post={item} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              <View><Text style={styles.brand}>Business <Text style={styles.brandAccent}>Ivoire</Text></Text><Text style={styles.location}>Abidjan · Opportunités locales</Text></View>
              <View style={styles.topActions}><ActionIcon icon="search" label="Rechercher" onPress={() => router.push("/discover" as never)} /><ActionIcon icon="notifications-none" label="Notifications" badge={3} onPress={() => router.push("/notifications" as never)} /></View>
            </View>
            <StoryStrip />
            <Card style={styles.composer}>
              <TouchableOpacity activeOpacity={0.72} onPress={() => router.push("/profile" as never)}><Avatar initials="BI" uri={profile.selfieUri} color="#0B6E8A" /></TouchableOpacity>
              <TouchableOpacity activeOpacity={0.74} onPress={() => router.push("/create" as never)} style={styles.composerField}><Text style={styles.composerText}>Partagez une opportunité…</Text></TouchableOpacity>
            </Card>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickAction} activeOpacity={0.7} onPress={() => router.push("/create" as never)}><MaterialIcons name="image" size={20} color="#1D8A5B" /><Text style={styles.quickText}>Photo</Text></TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} activeOpacity={0.7} onPress={() => router.push("/create" as never)}><MaterialIcons name="play-circle-outline" size={20} color="#E8752B" /><Text style={styles.quickText}>Reel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.quickAction} activeOpacity={0.7} onPress={() => router.push("/profile" as never)}><MaterialIcons name="add-circle-outline" size={20} color="#0B6E8A" /><Text style={styles.quickText}>Story</Text></TouchableOpacity>
            </View>
            <SectionTitle title="À la une" action="Voir les groupes" onPress={() => router.push("/discover" as never)} />
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F7F5EF" },
  content: { gap: 14, paddingBottom: 28, paddingHorizontal: 14 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingBottom: 10, paddingTop: 6 },
  brand: { color: "#16202A", fontSize: 25, fontWeight: "900", letterSpacing: -0.7 },
  brandAccent: { color: "#E8752B" },
  location: { color: "#667085", fontSize: 12, fontWeight: "600", marginTop: 2 },
  topActions: { flexDirection: "row", gap: 2 },
  storyList: { gap: 13, paddingBottom: 13, paddingTop: 4 },
  story: { alignItems: "center", width: 58 },
  storyRing: { alignItems: "center", borderRadius: 999, borderWidth: 2.5, height: 52, justifyContent: "center", position: "relative", width: 52 },
  storyAdd: { alignItems: "center", backgroundColor: "#0B6E8A", borderColor: "#F7F5EF", borderRadius: 10, borderWidth: 2, bottom: -4, height: 20, justifyContent: "center", position: "absolute", right: -5, width: 20 },
  storyName: { color: "#475467", fontSize: 11, fontWeight: "700", marginTop: 6, textAlign: "center" },
  composer: { alignItems: "center", flexDirection: "row", gap: 10, padding: 12 },
  composerField: { backgroundColor: "#F2F1EC", borderRadius: 20, flex: 1, paddingHorizontal: 15, paddingVertical: 12 },
  composerText: { color: "#667085", fontSize: 14, fontWeight: "600" },
  quickActions: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#E7E5DE", borderRadius: 16, borderWidth: 1, flexDirection: "row", justifyContent: "space-around", paddingVertical: 11 },
  quickAction: { alignItems: "center", flexDirection: "row", gap: 6, minHeight: 32 },
  quickText: { color: "#475467", fontSize: 13, fontWeight: "700" },
  postCard: { overflow: "hidden", paddingTop: 14 },
  postHeader: { alignItems: "center", flexDirection: "row", gap: 10, paddingHorizontal: 14 },
  postIdentity: { flex: 1 },
  postAuthor: { color: "#16202A", fontSize: 15, fontWeight: "800" },
  postMeta: { color: "#667085", fontSize: 12, fontWeight: "600", marginTop: 1 },
  postLocation: { color: "#8A8F98", fontSize: 11, marginTop: 1 },
  tagWrap: { marginHorizontal: 14, marginTop: 12 },
  postText: { color: "#29333D", fontSize: 15, lineHeight: 22, paddingHorizontal: 14, paddingVertical: 12 },
  postImage: { height: 205, resizeMode: "cover", width: "100%" },
  engagementInfo: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 10 },
  reactionCluster: { alignItems: "center", flexDirection: "row", gap: 5 },
  smallReaction: { alignItems: "center", backgroundColor: "#0B6E8A", borderRadius: 10, height: 20, justifyContent: "center", width: 20 },
  engagementText: { color: "#667085", fontSize: 12, fontWeight: "600" },
  postActions: { borderTopColor: "#EEECE6", borderTopWidth: 1, flexDirection: "row", justifyContent: "space-around", paddingVertical: 11 },
  postAction: { alignItems: "center", flexDirection: "row", gap: 6, minHeight: 28 },
  postActionText: { color: "#667085", fontSize: 12, fontWeight: "700" },
  activeAction: { color: "#0B6E8A" },
  commentsPanel: { borderTopColor: "#EEECE6", borderTopWidth: 1, gap: 9, padding: 13 },
  commentsHeading: { color: "#475467", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  comment: { alignItems: "flex-start", flexDirection: "row", gap: 8 },
  commentBubble: { backgroundColor: "#F2F1EC", borderRadius: 12, flex: 1, paddingHorizontal: 10, paddingVertical: 8 },
  commentAuthor: { color: "#16202A", fontSize: 12, fontWeight: "900" },
  commentBody: { color: "#475467", fontSize: 13, lineHeight: 18, marginTop: 2 },
  noComments: { color: "#7A858F", fontSize: 12, fontStyle: "italic" },
  commentComposer: { alignItems: "center", flexDirection: "row", gap: 7, marginTop: 3 },
  commentInput: { backgroundColor: "#F2F1EC", borderRadius: 18, color: "#16202A", flex: 1, fontSize: 13, minHeight: 38, paddingHorizontal: 11 },
  commentSend: { alignItems: "center", backgroundColor: "#0B6E8A", borderRadius: 17, height: 34, justifyContent: "center", width: 34 },
});
