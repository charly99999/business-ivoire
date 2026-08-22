import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type FeedPost = {
  id: string;
  author: string;
  role: string;
  place: string;
  avatar: string;
  publishedAt: string;
  text: string;
  image?: string;
  reactions: number;
  comments: number;
  reacted: boolean;
  tag: "Immobilier" | "Entrepreneuriat" | "Opportunité";
};

export type Conversation = {
  id: string;
  name: string;
  initials: string;
  preview: string;
  time: string;
  unread: number;
  color: string;
};

type Profile = {
  name: string;
  category: string;
  location: string;
  followers: number;
  bio: string;
  selfieUri?: string;
  coverUri?: string;
};

type BusinessContextValue = {
  posts: FeedPost[];
  profile: Profile;
  conversations: Conversation[];
  hydrated: boolean;
  publishPost: (text: string, category: FeedPost["tag"]) => void;
  toggleReaction: (id: string) => void;
  setSelfieUri: (uri: string) => void;
  setCoverUri: (uri: string) => void;
  sendMessage: (id: string, body: string) => void;
};

const CACHE_KEY = "business-ivoire-mobile-state";

const initialPosts: FeedPost[] = [
  {
    id: "post-1",
    author: "Aïcha Koné",
    role: "Conseillère immobilière",
    place: "Cocody, Abidjan",
    avatar: "AK",
    publishedAt: "Il y a 18 min",
    text: "Nouvelle opportunité à Angré : un appartement lumineux de 3 pièces, proche des commerces et immédiatement disponible. Écrivez-moi pour organiser une visite.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    reactions: 36,
    comments: 8,
    reacted: false,
    tag: "Immobilier",
  },
  {
    id: "post-2",
    author: "Kader Traoré",
    role: "Fondateur, Atelier Kôrô",
    place: "Plateau, Abidjan",
    avatar: "KT",
    publishedAt: "Il y a 52 min",
    text: "Nous ouvrons trois postes pour renforcer notre équipe commerciale. Une belle occasion pour les profils qui aiment le terrain, le service client et les résultats concrets.",
    reactions: 58,
    comments: 14,
    reacted: true,
    tag: "Entrepreneuriat",
  },
  {
    id: "post-3",
    author: "Business Ivoire",
    role: "Communauté professionnelle",
    place: "Abidjan, Côte d’Ivoire",
    avatar: "BI",
    publishedAt: "Hier",
    text: "Cette semaine, partagez une initiative qui fait avancer votre quartier, votre entreprise ou votre projet. Les meilleures contributions seront mises en avant dans la communauté.",
    reactions: 124,
    comments: 27,
    reacted: false,
    tag: "Opportunité",
  },
];

const initialProfile: Profile = {
  name: "Business Ivoire",
  category: "Immobilier & Entrepreneuriat",
  location: "Abidjan, Côte d’Ivoire",
  followers: 2480,
  bio: "La communauté qui relie les idées, les talents et les opportunités qui font grandir la Côte d’Ivoire.",
};

const initialConversations: Conversation[] = [
  { id: "aicha", name: "Aïcha Koné", initials: "AK", preview: "Je vous envoie le dossier cet après-midi.", time: "10:42", unread: 2, color: "#E8752B" },
  { id: "groupe", name: "Immobilier Abidjan", initials: "IA", preview: "Yao : Bonjour à tous, des nouvelles du projet ?", time: "09:18", unread: 5, color: "#0B6E8A" },
  { id: "kader", name: "Kader Traoré", initials: "KT", preview: "Merci pour votre retour, c’est noté.", time: "Hier", unread: 0, color: "#1D8A5B" },
];

const BusinessContext = createContext<BusinessContextValue | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState(initialPosts);
  const [profile, setProfile] = useState(initialProfile);
  const [conversations, setConversations] = useState(initialConversations);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (raw) {
          const state = JSON.parse(raw) as Partial<{ posts: FeedPost[]; profile: Profile; conversations: Conversation[] }>;
          if (state.posts) setPosts(state.posts);
          if (state.profile) setProfile(state.profile);
          if (state.conversations) setConversations(state.conversations);
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ posts, profile, conversations }));
  }, [conversations, hydrated, posts, profile]);

  const value = useMemo<BusinessContextValue>(() => ({
    posts,
    profile,
    conversations,
    hydrated,
    publishPost: (text, category) => {
      const cleanText = text.trim();
      if (!cleanText) return;
      setPosts((current) => [
        {
          id: `post-${Date.now()}`,
          author: profile.name,
          role: "Page professionnelle",
          place: profile.location,
          avatar: "BI",
          publishedAt: "À l’instant",
          text: cleanText,
          reactions: 0,
          comments: 0,
          reacted: false,
          tag: category,
        },
        ...current,
      ]);
    },
    toggleReaction: (id) => {
      setPosts((current) => current.map((post) => {
        if (post.id !== id) return post;
        return { ...post, reacted: !post.reacted, reactions: post.reactions + (post.reacted ? -1 : 1) };
      }));
    },
    setSelfieUri: (uri) => setProfile((current) => ({ ...current, selfieUri: uri })),
    setCoverUri: (uri) => setProfile((current) => ({ ...current, coverUri: uri })),
    sendMessage: (id, body) => {
      const cleanBody = body.trim();
      if (!cleanBody) return;
      setConversations((current) => current.map((conversation) => (
        conversation.id === id ? { ...conversation, preview: `Vous : ${cleanBody}`, time: "À l’instant", unread: 0 } : conversation
      )));
    },
  }), [conversations, hydrated, posts, profile]);

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) throw new Error("useBusiness doit être utilisé dans BusinessProvider");
  return context;
}
